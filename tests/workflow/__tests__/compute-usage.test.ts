/**
 * Compute Usage Workflow Test
 *
 * End-to-end verification of the compute usage logging pipeline:
 *   1. Insert a job → compute-worker picks it up
 *   2. Verify invocation tracking (platform_function_invocations)
 *   3. Verify compute log entry (platform_compute_log)
 *   4. Run rollup → verify usage_daily aggregation
 *   5. Query via GraphQL to verify API exposure
 *
 * Prerequisites:
 *   make up           # deploy DB + start GraphQL server
 *   make dev-compute  # start compute-worker + node-example function
 */
import { getTestClient, closeConnections, sleep, type TestClient } from '../utils/db';

const DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const TEST_PREFIX = 'workflow-test';

let pg: TestClient;

beforeAll(async () => {
  pg = getTestClient();
  await pg.query('SELECT 1');
});

afterAll(async () => {
  // Clean up test jobs
  await pg.query(
    `DELETE FROM app_jobs.jobs WHERE task_identifier LIKE $1`,
    [`${TEST_PREFIX}%`]
  ).catch(() => {});
  await closeConnections();
});

describe('Compute Usage Pipeline', () => {
  describe('job dispatch + invocation tracking', () => {
    let jobId: string;

    it('should insert a job for node-example', async () => {
      const row = await pg.one<{ id: string; task_identifier: string }>(
        `WITH _cfg AS (
          SELECT set_config('jwt.claims.database_id', $1, true)
        )
        SELECT j.id, j.task_identifier
        FROM _cfg, app_jobs.add_job('node-example'::text, $2::json) AS j`,
        [DATABASE_ID, JSON.stringify({ message: 'workflow test', _test: true })]
      );

      expect(row.id).toBeDefined();
      expect(row.task_identifier).toBe('node-example');
      jobId = row.id;
    });

    it('should be picked up by the compute-worker within 30s', async () => {
      const timeout = 30_000;
      const poll = 500;
      const start = Date.now();

      while (Date.now() - start < timeout) {
        const job = await pg.oneOrNone(
          `SELECT id, locked_by, last_error FROM app_jobs.jobs WHERE id = $1`,
          [jobId]
        );

        // Job deleted = completed successfully
        if (!job) return;

        // Job has error = failed (but may retry)
        if ((job as Record<string, unknown>).last_error) {
          // If it's a real failure (not just locked), fail the test
          const attempts = await pg.oneOrNone<{ attempts: number }>(
            `SELECT attempts FROM app_jobs.jobs WHERE id = $1`,
            [jobId]
          );
          if (attempts && attempts.attempts >= 3) {
            throw new Error(
              `Job ${jobId} failed after ${attempts.attempts} attempts: ${(job as Record<string, unknown>).last_error}`
            );
          }
        }

        await sleep(poll);
      }

      // Check one more time
      const job = await pg.oneOrNone(
        `SELECT id, last_error FROM app_jobs.jobs WHERE id = $1`,
        [jobId]
      );
      if (job) {
        throw new Error(
          `Job ${jobId} was not processed within ${timeout}ms. last_error: ${(job as Record<string, unknown>).last_error || 'none'}`
        );
      }
    }, 35_000);

    it('should have created an invocation record', async () => {
      // Wait a moment for async writes
      await sleep(500);

      const rows = await pg.any<{
        task_identifier: string;
        status: string;
        duration_ms: number;
      }>(
        `SELECT task_identifier, status, duration_ms
         FROM constructive_compute_public.platform_function_invocations
         WHERE task_identifier = 'node-example'
         ORDER BY created_at DESC
         LIMIT 5`
      );

      expect(rows.length).toBeGreaterThan(0);
      const latest = rows[0];
      expect(latest.task_identifier).toBe('node-example');
      expect(['completed', 'failed']).toContain(latest.status);
      expect(latest.duration_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('compute log', () => {
    it('should have a compute log entry for the dispatched job', async () => {
      const rows = await pg.any<{
        task_identifier: string;
        status: string;
        duration_ms: number;
        database_id: string;
      }>(
        `SELECT task_identifier, status, duration_ms, database_id
         FROM constructive_compute_public.platform_compute_log
         WHERE task_identifier = 'node-example'
         ORDER BY completed_at DESC
         LIMIT 5`
      );

      expect(rows.length).toBeGreaterThan(0);
      const latest = rows[0];
      expect(latest.task_identifier).toBe('node-example');
      expect(['completed', 'failed']).toContain(latest.status);
      expect(latest.duration_ms).toBeGreaterThanOrEqual(0);
      expect(latest.database_id).toBe(DATABASE_ID);
    });
  });

  describe('usage daily rollup', () => {
    it('should aggregate compute log into usage_daily via rollup_compute_daily()', async () => {
      const result = await pg.one<{ n: string }>(
        `SELECT count(*) AS n FROM constructive_compute_private.rollup_compute_daily(now() - interval '1 day')`
      );
      const upserted = parseInt(result.n, 10);
      expect(upserted).toBeGreaterThan(0);
    });

    it('should have usage_daily rows with correct aggregation', async () => {
      const rows = await pg.any<{
        task_identifier: string;
        date: string;
        total_calls: number;
        successful: number;
        failed: number;
        total_duration_ms: number;
      }>(
        `SELECT task_identifier, date, total_calls, successful, failed, total_duration_ms
         FROM constructive_compute_public.platform_usage_daily
         WHERE task_identifier = 'node-example'
         ORDER BY date DESC
         LIMIT 5`
      );

      expect(rows.length).toBeGreaterThan(0);
      const latest = rows[0];
      expect(latest.task_identifier).toBe('node-example');
      expect(Number(latest.total_calls)).toBeGreaterThan(0);
      expect(Number(latest.successful) + Number(latest.failed)).toBe(Number(latest.total_calls));
      expect(Number(latest.total_duration_ms)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GraphQL exposure', () => {
    const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://compute.localhost:6464/graphql';

    it('should expose platformComputeLogs via GraphQL', async () => {
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            platformComputeLogs(first: 5, orderBy: [COMPLETED_AT_DESC]) {
              nodes { id taskIdentifier status durationMs }
              totalCount
            }
          }`,
        }),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as {
        data?: {
          platformComputeLogs?: {
            nodes: Array<{ id: string; taskIdentifier: string; status: string }>;
            totalCount: number;
          };
        };
        errors?: unknown[];
      };
      expect(body.errors).toBeUndefined();
      expect(body.data?.platformComputeLogs?.totalCount).toBeGreaterThan(0);
    });

    it('should expose platformUsageDailies via GraphQL', async () => {
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
            platformUsageDailies(first: 5, orderBy: [DATE_DESC]) {
              nodes { id taskIdentifier date totalCalls successful failed }
              totalCount
            }
          }`,
        }),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as {
        data?: {
          platformUsageDailies?: {
            nodes: Array<{ id: string; taskIdentifier: string; totalCalls: number }>;
            totalCount: number;
          };
        };
        errors?: unknown[];
      };
      expect(body.errors).toBeUndefined();
      expect(body.data?.platformUsageDailies?.totalCount).toBeGreaterThan(0);
    });
  });
});
