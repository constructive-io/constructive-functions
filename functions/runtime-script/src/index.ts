
import { GraphQLClient } from 'graphql-request';
import { Pool } from 'pg';

import gql from 'graphql-tag';
import fetch from 'cross-fetch';

// Proof of GQL connection
const GetUsers = gql`
  query GetUsers {
    users {
      nodes {
        id
        username
      }
    }
  }
`;

export default async (params: any, context: any) => {
    const { client } = context;
    console.log('[runtime-script] Received script request');

    let users = null;
    try {
        const data = await client.request(GetUsers);
        users = data?.users;
    } catch (e: any) {
        console.warn('GQL Request failed:', e.message);
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
