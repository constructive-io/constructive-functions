import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres123!',
      database: process.env.PGDATABASE || 'constructive',
    });
  }
  return pool;
}

export interface TestClient {
  query(text: string, params?: any[]): Promise<pg.QueryResult>;
  oneOrNone<T = any>(text: string, params?: any[]): Promise<T | null>;
  any<T = any>(text: string, params?: any[]): Promise<T[]>;
  result(text: string, params?: any[]): Promise<pg.QueryResult>;
}

function createTestClient(): TestClient {
  const p = getPool();

  return {
    async query(text: string, params?: any[]) {
      return p.query(text, params);
    },

    async oneOrNone<T = any>(text: string, params?: any[]): Promise<T | null> {
      const res = await p.query(text, params);
      return (res.rows[0] as T) ?? null;
    },

    async any<T = any>(text: string, params?: any[]): Promise<T[]> {
      const res = await p.query(text, params);
      return res.rows as T[];
    },

    async result(text: string, params?: any[]) {
      return p.query(text, params);
    },
  };
}

let client: TestClient | null = null;

export async function getTestConnections(): Promise<{ pg: TestClient }> {
  if (!client) {
    client = createTestClient();
    await client.query('SELECT 1');
  }
  return { pg: client };
}

export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    client = null;
  }
}

export async function getDatabaseId(pg: TestClient): Promise<string> {
  const row = await pg.oneOrNone<{ id: string }>(
    `SELECT id FROM metaschema_public.database ORDER BY created_at LIMIT 1`
  );
  if (!row) {
    throw new Error('No database found in metaschema_public.database');
  }
  return row.id;
}

export async function verifyJobsSchema(pg: TestClient): Promise<{
  schemaExists: boolean;
  addJobExists: boolean;
  getJobExists: boolean;
  completeJobExists: boolean;
  failJobExists: boolean;
}> {
  const schema = await pg.oneOrNone(
    `SELECT 1 FROM information_schema.schemata WHERE schema_name = 'app_jobs'`
  );

  if (!schema) {
    return {
      schemaExists: false,
      addJobExists: false,
      getJobExists: false,
      completeJobExists: false,
      failJobExists: false,
    };
  }

  const functions = await pg.any<{ proname: string }>(
    `SELECT p.proname FROM pg_proc p
     JOIN pg_namespace n ON p.pronamespace = n.oid
     WHERE n.nspname = 'app_jobs'
       AND p.proname IN ('add_job', 'get_job', 'complete_job', 'fail_job')`
  );

  const fnNames = functions.map((f) => f.proname);

  return {
    schemaExists: true,
    addJobExists: fnNames.includes('add_job'),
    getJobExists: fnNames.includes('get_job'),
    completeJobExists: fnNames.includes('complete_job'),
    failJobExists: fnNames.includes('fail_job'),
  };
}
