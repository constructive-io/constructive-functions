const path = require('path');
const fs = require('fs');

const run = async () => {
    // 1. Resolve Dependencies from CWD (User's Function Context)
    // This logic ensures we find express/graphql-request in the function's node_modules,
    // regardless of where runner.js is located (Local Dev vs Docker).
    const resolveDep = (name) => {
        try {
            // Priority 1: User's local node_modules (if present)
            return require(require.resolve(name, { paths: [process.cwd()] }));
        } catch (e) {
            try {
                // Priority 2: Runtime's node_modules (Base Image context)
                return require(require.resolve(name, { paths: [__dirname] }));
            } catch (e2) {
                console.error(`[runner] Failed to resolve dependency '${name}'`);
                console.error(`Checked locations: ${process.cwd()}, ${__dirname}`);
                console.error(e.message);
                process.exit(1);
            }
        }
    };

    const express = resolveDep('express');
    const bodyParser = resolveDep('body-parser');
    const { GraphQLClient } = resolveDep('graphql-request');
    const http = require('http');
    const https = require('https');
    const { URL } = require('url');

    // 2. Resolve User Handler
    const relativePath = process.argv[2] || 'dist/index.js';
    const absolutePath = path.resolve(process.cwd(), relativePath);

    let userModule;
    try {
        userModule = require(absolutePath);
    } catch (e) {
        console.error(`[runner] Failed to load function at ${absolutePath}`);
        console.error(e.message);
        process.exit(1);
    }

    const handler = userModule.default || userModule;

    if (typeof handler !== 'function') {
        console.error(`[runner] Export at ${absolutePath} is not a function.`);
        process.exit(1);
    }

    // 3. Setup App & Helper Functions (Ported from knative-job-fn/src/index.ts)
    // We implement a simplified version of the logic to avoid needing deep imports.
    // However, since we are replacing the shim which used `express` directly usually,
    // or `knative-job-fn` library...
    // Correct approach: The shim used `app` from `@constructive-io/knative-job-fn`.
    // We should try to use THAT if available, to preserve exact behavior (headers, logging).

    let app;
    try {
        // Try to load the standard wrapper if present
        const jobFn = resolveDep('@constructive-io/knative-job-fn');
        // The library usually exports { default: { post: ..., listen: ... } } or similar?
        // Let's check how functions imported it: "import app from '@constructive-io/knative-job-fn';"
        // It exports 'default'.
        const lib = jobFn.default || jobFn;

        // The library exposes an 'app' like object but 'listen' is the main entry.
        // But we want to inject our handler into a route.
        // Library usage in shim: `app.post('/', ...)`
        // Library implementation: `app` IS express() basically, but wrapped.

        // Actually the library exports an object: { post: ..., listen: ... }
        // We can use it directly.
        app = lib;
    } catch (e) {
        // Fallback to raw express if wrapper missing (unlikely given package.json)
        console.warn('[runner] @constructive-io/knative-job-fn not found, falling back to raw express');
        app = express();
        app.use(bodyParser.json());
    }

    // 4. Setup GraphQL Client
    const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql';
    if (!process.env.GRAPHQL_ENDPOINT) {
        // Warn if falling back, to aid debugging
        console.warn(`[runner] GRAPHQL_ENDPOINT not set, defaulting to internal k8s service: ${graphqlEndpoint}`);
    }
    const client = new GraphQLClient(graphqlEndpoint);

    // 5. Setup Route
    // 5. Setup Route
    // 6. Start Server
    const port = Number(process.env.PORT ?? 8080);
    app.post('/', async (req, res) => {
        try {
            console.log('[runner] Incoming Request Body:', JSON.stringify(req.body));
            // Context Injection: Parse User Identity
            const authHeader = req.headers['authorization'];
            const xUserId = req.headers['x-user-id'];
            let user = null;

            if (xUserId) {
                user = { id: xUserId };
            } else if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const payload = token.split('.')[1];
                    if (payload) {
                        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
                        user = {
                            id: decoded.sub || decoded.user_id,
                            ...decoded
                        };
                    }
                } catch (e) {
                    console.warn('[runner] Failed to parse JWT token:', e.message);
                }
            }

            const context = {
                client,
                headers: req.headers,
                user
            };

            // Async/Flow Tracking Logic
            const isAsync = req.headers['x-constructive-async'] === 'true';

            if (isAsync) {
                // Resolve pg (Available in root or container)
                let pg;
                try {
                    pg = require('pg');
                } catch (e) {
                    // unexpected if we installed it, but fallback
                    console.error('[runner] pg module not found, cannot run async flow');
                    return res.status(500).json({ error: 'Async mode requires pg module' });
                }

                const { Client } = pg;

                // Use standard PG env vars
                const pgClient = new Client({
                    user: process.env.PGUSER || 'postgres',
                    host: process.env.PGHOST || 'postgres',
                    database: process.env.PGDATABASE || 'postgres',
                    password: process.env.PGPASSWORD,
                    port: Number(process.env.PGPORT || 5432),
                });

                try {
                    await pgClient.connect();
                    // Insert Pending Flow
                    // Assuming flow schema is deployed
                    const result = await pgClient.query(`
                        INSERT INTO flow.flows (status, meta)
                        VALUES ($1, $2)
                        RETURNING id
                    `, ['pending', JSON.stringify({ headers: req.headers, body: req.body })]);

                    const flowId = result.rows[0].id;
                    await pgClient.end();

                    // Respond immediately
                    res.status(202).json({
                        job_id: flowId,
                        status: 'pending',
                        message: 'Request accepted for background processing'
                    });

                    // Disable response methods to prevent later writes
                    // But express might handle this. 
                    // We just detached.

                    // Background Execution
                    (async () => {
                        const bgClient = new Client({
                            user: process.env.PGUSER || 'postgres',
                            host: process.env.PGHOST || 'postgres',
                            database: process.env.PGDATABASE || 'postgres',
                            password: process.env.PGPASSWORD,
                            port: Number(process.env.PGPORT || 5432),
                        });
                        await bgClient.connect();

                        try {
                            // Update Processing
                            await bgClient.query('UPDATE flow.flows SET status = $1, progress = 10, updated_at = now() WHERE id = $2', ['processing', flowId]);

                            // Execute Handler
                            const handlerResult = await handler(req.body, context);

                            // Update Completed
                            await bgClient.query('UPDATE flow.flows SET status = $1, result = $2, progress = 100, updated_at = now() WHERE id = $3', ['completed', JSON.stringify(handlerResult), flowId]);

                        } catch (err) {
                            console.error(`[runner] Async Job ${flowId} failed:`, err);
                            await bgClient.query('UPDATE flow.flows SET status = $1, result = $2, updated_at = now() WHERE id = $3', ['failed', JSON.stringify({ error: err.message, stack: err.stack }), flowId]);
                        } finally {
                            await bgClient.end();
                        }
                    })();

                    return; // End request handling here

                } catch (dbErr) {
                    console.error('[runner] DB Error in Async setup:', dbErr);
                    // If DB fails, fallback to sync or error? 
                    // Error 500
                    if (pgClient) pgClient.end().catch(() => ({}));
                    return res.status(500).json({ error: 'Failed to initialize async flow', details: dbErr.message });
                }
            }

            const result = await handler(req.body, context);

            // Standard Shim Error Handling Heuristics
            if (result && result.error) {
                // Heuristics for 400 vs 500
                if (['Missing prompt', 'Unsupported provider', 'Missing "query" in payload',
                    'Missing repoName or githubToken', 'Missing X-Database-Id header or DEFAULT_DATABASE_ID',
                    'Missing required field', "Either 'html' or 'text' must be provided",
                    "Missing address, message, or signature"].some(s => typeof result.error === 'string' && (result.error.includes(s) || s === result.error))) {
                    return res.status(400).json(result);
                }
                return res.status(500).json(result);
            }

            res.status(200).json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });

    app.listen(port, () => {
        console.log(`[runner] Function '${relativePath}' listening on port ${port}`);
    });
};

run().catch(e => {
    console.error('[runner] Fatal:', e);
    process.exit(1);
});
