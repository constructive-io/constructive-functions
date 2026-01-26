import { createClient } from '@constructive-db/constructive-sdk';
import { Pool } from 'pg';
import fetch from 'cross-fetch';

export default async (params: any, context: any) => {
    console.log('[runtime-script] PARAMS:', JSON.stringify(params));
    // Clean headers to avoid conflicts with SDK defaults
    const safeHeaders = { ...context.headers };
    ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

    // Initialize SDK with context headers for auth propagation
    const sdk = createClient({
        endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
        headers: safeHeaders || {}
    });

    console.log('[runtime-script] Received script request');

    // SDK call without try-catch
    const result = await sdk.api.findMany({
        select: { id: true, name: true },
        first: 10
    }).execute();

    console.log('[runtime-script] GQL Response:', JSON.stringify(result, null, 2));

    const users = result.ok ? result.data : null;
    if (!result.ok) {
        console.error('GQL Request failed:', result.errors);
    }

    const query = params.query;

    if (!query) {
        return { error: 'Missing "query" in payload' };
    }

    console.log('[runtime-script] Executing query:', query);

    const pool = new Pool({
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'launchql'
    });

    let poolClient;
    try {
        poolClient = await pool.connect();
        const result = await poolClient.query(query);

        console.log(`[runtime-script] Query executed. Rows: ${result.rowCount}`);

        return {
            message: 'Script executed successfully',
            rowCount: result.rowCount,
            rows: result.rows,
            users
        };
    } catch (error: any) {
        console.error('[runtime-script] Execution failed:', error);
        return {
            error: 'Script execution failed',
            details: error.message
        };
    } finally {
        if (poolClient) {
            poolClient.release();
        }
        await pool.end();
    }
};


// Server boilerplate abstracted to runner.js
