import { createJobApp } from '@constructive-io/knative-job-fn';
import { createLogger } from '@pgpmjs/logger';
import { Pool } from 'pg';
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
    });
  }
  return pool;
}

// Create HTTP server
const app = createJobApp();
const log = createLogger('{{name}}');

app.post('/', async (req: any, res: any, next: any) => {
  try {
    const context = {
      job: {
        jobId: req.get('X-Job-Id') || req.get('x-job-id'),
        workerId: req.get('X-Worker-Id') || req.get('x-worker-id'),
        databaseId: req.get('X-Database-Id') || req.get('x-database-id') || process.env.DEFAULT_DATABASE_ID,
      },
      pool: getPool(),
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
