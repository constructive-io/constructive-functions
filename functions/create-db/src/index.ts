
import { Client } from 'pg';

export default async (params: any, context: any) => {
  const dbName = params.database;
  if (!dbName) {
    throw new Error('Missing parameter: database');
  }

  // Sanitize dbName to be safe for SQL identifier
  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error('Invalid database name: must be alphanumeric and underscores only');
  }

  console.log(`[create-db] Request to create database: ${dbName}`);

  // Connect to the maintenance database (postgres or template1)
  // We use process.env vars which should be injected by the runner/container
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD,
    database: 'postgres', // Connect to default maintenance DB
  });

  try {
    await client.connect();

    // Check if exists
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount && res.rowCount > 0) {
      console.log(`[create-db] Database ${dbName} already exists.`);
      return {
        created: false,
        exists: true,
        message: `Database ${dbName} already exists`
      };
    }

    // Create Database
    // Note: CREATE DATABASE cannot run locally in a transaction block, 
    // but typically cloud function handlers aren't wrapped in one by default logic here unless knative-job-fn does it.
    // Assuming we are free.
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`[create-db] Database ${dbName} created successfully.`);

    return {
      created: true,
      exists: true,
      message: `Database ${dbName} created successfully`
    };

  } catch (e: any) {
    console.error('[create-db] Failed to create database:', e);
    return {
      error: e.message,
      stack: e.stack
    };
  } finally {
    await client.end();
  }
};
