import { createJobApp } from '@constructive-io/knative-job-fn';
import { createLogger } from '@pgpmjs/logger';
import { getPgPool } from 'pg-cache';
import { Pool, PoolClient } from 'pg';
import handler from './handler';

function createWithUserContext(pool: Pool, databaseId: string | undefined) {
  return async function withUserContext<T>(
    actorId: string | undefined,
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (databaseId) {
        await client.query(`SELECT set_config('jwt.claims.database_id', $1, true)`, [databaseId]);
      }
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
        // Ignore rollback errors
      }
      throw err;
    } finally {
      client.release();
    }
  };
}

const app = createJobApp();
const log = createLogger('{{name}}');

app.post('/', async (req: any, res: any, next: any) => {
  try {
    const databaseId = req.get('X-Database-Id') || process.env.DEFAULT_DATABASE_ID;
    const currentPool = getPgPool({});

    const context = {
      job: {
        jobId: req.get('X-Job-Id'),
        workerId: req.get('X-Worker-Id'),
        databaseId,
      },
      pool: currentPool,
      withUserContext: createWithUserContext(currentPool, databaseId),
      log,
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
