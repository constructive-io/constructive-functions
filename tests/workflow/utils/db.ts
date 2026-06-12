/**
 * Database helpers for workflow tests.
 *
 * Connects to the pgpm-local PostgreSQL (default: constructive-functions-db1).
 * Extends the e2e pattern but targets the local dev stack (make up).
 */
import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'password',
      database: process.env.TEST_DATABASE || 'constructive-functions-db1',
    });
  }
  return pool;
}

export interface TestClient {
  query(text: string, params?: unknown[]): Promise<pg.QueryResult>;
  one<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T>;
  oneOrNone<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | null>;
  any<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}

function createTestClient(): TestClient {
  const p = getPool();

  return {
    async query(text: string, params?: unknown[]) {
      return p.query(text, params);
    },

    async one<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T> {
      const res = await p.query(text, params);
      if (res.rows.length === 0) throw new Error(`Expected 1 row, got 0 for: ${text}`);
      return res.rows[0] as T;
    },

    async oneOrNone<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | null> {
      const res = await p.query(text, params);
      return (res.rows[0] as T) ?? null;
    },

    async any<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
      const res = await p.query(text, params);
      return res.rows as T[];
    },
  };
}

let client: TestClient | null = null;

export function getTestClient(): TestClient {
  if (!client) {
    client = createTestClient();
  }
  return client;
}

export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    client = null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
