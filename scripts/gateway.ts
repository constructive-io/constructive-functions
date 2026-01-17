
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { GraphQLClient } from 'graphql-request';

const PORT = 3000;
const FUNCTIONS_DIR = path.join(__dirname, '../functions');

const app = express();
app.use(bodyParser.json());

// Mock Context
import { Pool } from 'pg';
const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql';
const client = new GraphQLClient(graphqlEndpoint);

// Router DB Pool
const routerDbUrl = process.env.ROUTER_DB_URL;
let routerPool: Pool | null = null;
if (routerDbUrl) {
    console.log('[Gateway] RPC Router Enabled. Connecting to Router DB...');
    routerPool = new Pool({ connectionString: routerDbUrl });
}

// Router Middleware Helper
const resolveTenantConnection = async (tenantId: string): Promise<string | null> => {
    if (!routerPool) return null;
    try {
        // Query existing services_public.database table from constructive-db
        const res = await routerPool.query(`
            SELECT name 
            FROM services_public.database 
            WHERE id::text = $1 OR name = $1
        `, [tenantId]);

        if (res.rows.length > 0) {
            const dbName = res.rows[0].name;
            // For prototype: Derive connection string or finding env var
            // Real implementation would look up in encrypted_secrets or similar
            const derivedConnection = process.env[`DB_${dbName.toUpperCase()}_URL`] ||
                `postgres://postgres:postgres@localhost:5432/${dbName}`;
            return derivedConnection;
        }
    } catch (e) {
        console.error('[Gateway] Router Resolution Failed:', e);
    }
    return null;
};

// Helper to load all configs first
import { loadConfig } from './config-loader';

const applyGlobalConfig = () => {
    const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
    console.log('[Gateway] Loading configurations...');
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

        const config = loadConfig(entry.name);
        for (const key in config) {
            if (process.env[key] === undefined && config[key] !== undefined) {
                process.env[key] = config[key]; // Don't overwrite existing system envs
            }
        }
    }

    // Patch to prevent @launchql/postmaster from exiting process on import
    const requiredKeys = ['MAILGUN_DOMAIN', 'MAILGUN_FROM', 'MAILGUN_REPLY', 'MAILGUN_KEY'];
    for (const key of requiredKeys) {
        if (!process.env[key]) {
            process.env[key] = key === 'MAILGUN_DOMAIN' ? 'example.com' : 'mock@example.com';
        }
    }
};

applyGlobalConfig();

const loadFunctions = async () => {
    const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

        const fnName = entry.name;
        const fnPath = path.join(FUNCTIONS_DIR, fnName);
        const pkgPath = path.join(fnPath, 'package.json');

        if (!fs.existsSync(pkgPath)) {
            console.warn(`[Gateway] Skipping ${fnName}: No package.json`);
            continue;
        }

        try {
            const pkg = require(pkgPath);
            // Only mount Node functions with a main entry matching dist/index.js (standardized)
            // Or fallback to checking if dist/index.js exists
            const mainFile = pkg.main || 'dist/index.js';
            const absMainPath = path.resolve(fnPath, mainFile);

            if (!fs.existsSync(absMainPath)) {
                // Try building? Or just skip and warn.
                console.warn(`[Gateway] Skipping ${fnName}: Main file ${mainFile} not found (try 'pnpm build'?)`);
                continue;
            }

            // Import the function
            // We use require because these are CommonJS compiled files mostly
            let handlerModule = require(absMainPath);
            let handler = handlerModule.default || handlerModule;

            if (typeof handler !== 'function') {
                // Check if it's the { post: ..., listen: ... } object from knative-job-fn
                if (handler.post) {
                    // It is an app-like object.
                    // We can't easily mount an express app on a path with full fidelity without mountpath issues,
                    // but let's try app.use
                    console.log(`[Gateway] Mounting App-like Function: /${fnName}`);
                    app.use(`/${fnName}`, handler);
                    continue;
                }
                console.warn(`[Gateway] Skipping ${fnName}: Export is not a function or app`);
                continue;
            }

            console.log(`[Gateway] Mounting Function: /${fnName}`);

            // Mount as POST route
            app.post(`/${fnName}`, async (req, res) => {
                console.log(`[Gateway] Invoke ${fnName}`);
                try {
                    // Router Resolution
                    const tenantId = req.headers['x-tenant-id'] as string;
                    let resolvedConnection = null;
                    if (tenantId) {
                        resolvedConnection = await resolveTenantConnection(tenantId);
                        if (resolvedConnection) {
                            console.log(`[Gateway] Routed Tenant ${tenantId} -> ${resolvedConnection}`);
                        } else {
                            console.warn(`[Gateway] Tenant ${tenantId} not found in Router.`);
                        }
                    }

                    const context = {
                        client,
                        headers: req.headers,
                        router: {
                            tenantId,
                            connectionString: resolvedConnection
                        }
                    };

                    const result = await handler(req.body, context);

                    if (result && result.error) {
                        return res.status(500).json(result);
                    }
                    res.json(result);
                } catch (e: any) {
                    console.error(e);
                    res.status(500).json({ error: e.message });
                }
            });

        } catch (e: any) {
            console.warn(`[Gateway] Failed to load ${fnName}:`, e.message);
        }
    }
};

const start = async () => {
    await loadFunctions();

    // Root info
    app.get('/', (req, res) => {
        res.json({
            service: 'Constructive Functions Gateway',
            status: 'running',
            endpoints: app._router.stack
                .filter((r: any) => r.route && r.route.path)
                .map((r: any) => r.route.path)
        });
    });

    app.listen(PORT, () => {
        console.log(`\n🚀 Gateway running at http://localhost:${PORT}`);
        console.log(`   Functions mounted at /<function-name>\n`);
    });
};

start();
