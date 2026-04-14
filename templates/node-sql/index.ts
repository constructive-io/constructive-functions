import { createJobApp } from '@constructive-io/knative-job-fn';
import { createLogger } from '@pgpmjs/logger';
import { Pool, PoolClient } from 'pg';
import handler from './handler';

// Create PostgreSQL pool (singleton)
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      // Connection pool settings (configurable via env)
      max: Number(process.env.PGPOOL_MAX || 10),
      idleTimeoutMillis: Number(process.env.PGPOOL_IDLE_TIMEOUT || 30000),
      connectionTimeoutMillis: Number(process.env.PGPOOL_CONNECTION_TIMEOUT || 5000),
    });
  }
  return pool;
}

/**
 * Execute a function with RLS user context.
 * Sets jwt.claims for RLS policies and switches to authenticated role.
 */
function createWithUserContext(pool: Pool, databaseId: string | undefined) {
  return async function withUserContext<T>(
    actorId: string | undefined,
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Set database context for RLS
      if (databaseId) {
        await client.query(`SELECT set_config('jwt.claims.database_id', $1, true)`, [databaseId]);
      }
      // Set user context for RLS
      if (actorId) {
        await client.query(`SELECT set_config('jwt.claims.user_id', $1, true)`, [actorId]);
        await client.query('SET LOCAL ROLE authenticated');
      }

      const result = await fn(client);

      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Ignore rollback errors (connection may already be broken)
      }
      throw err;
    } finally {
      client.release();
    }
  };
}

// Create HTTP server
const app = createJobApp();
const log = createLogger('{{name}}');

app.post('/', async (req: any, res: any, next: any) => {
  try {
    const databaseId = req.get('X-Database-Id') || req.get('x-database-id') || process.env.DEFAULT_DATABASE_ID;
    const currentPool = getPool();

    const context = {
      job: {
        jobId: req.get('X-Job-Id') || req.get('x-job-id'),
        workerId: req.get('X-Worker-Id') || req.get('x-worker-id'),
        databaseId,
      },
      pool: currentPool,
      withUserContext: createWithUserContext(currentPool, databaseId),
      log,
      env: process.env as Record<string, string | undefined>,
    };

    const params = req.body || {};
    const result = await handler(params, context);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

export default app;

if (require.main === module) {
  app.listen(Number(process.env.PORT || 8080));
}
