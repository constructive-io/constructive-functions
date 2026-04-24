import { Client } from 'pg';

const PG_CONFIG = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres123!',
  database: process.env.PGDATABASE || 'constructive',
};

const JOB_TIMEOUT = 15000;

describe('sql-example e2e', () => {
  let client: Client;
  let databaseId: string;

  beforeAll(async () => {
    client = new Client(PG_CONFIG);
    await client.connect();

    const dbResult = await client.query(
      `SELECT id FROM metaschema_public.database LIMIT 1`
    );
    if (dbResult.rows.length === 0) {
      throw new Error('No database record found in metaschema_public.database');
    }
    databaseId = dbResult.rows[0].id;
  });

  afterAll(async () => {
    await client.end();
  });

  it('should process sql-example job via job queue', async () => {
    const payload = {};

    const insertResult = await client.query(
      `SELECT * FROM app_jobs.add_job($1, 'sql-example'::text, $2::json)`,
      [databaseId, JSON.stringify(payload)]
    );

    const jobId = insertResult.rows[0].id;
    expect(jobId).toBeDefined();

    const startTime = Date.now();
    let completed = false;
    let jobResult: any;

    while (Date.now() - startTime < JOB_TIMEOUT) {
      const statusResult = await client.query(
        `SELECT * FROM app_jobs.jobs WHERE id = $1`,
        [jobId]
      );

      if (statusResult.rows.length === 0) {
        completed = true;
        break;
      }

      const job = statusResult.rows[0];
      if (job.last_error) {
        throw new Error(`Job failed: ${job.last_error}`);
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    expect(completed).toBe(true);
  });
});
