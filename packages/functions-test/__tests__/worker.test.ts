/**
 * Phase 3: Compute-worker integration tests.
 *
 * Tests the full pipeline: job → GUC propagation → HTTP dispatch →
 * invocation tracking → compute_log → usage_daily rollup.
 *
 * Uses real compute-worker classes (ModuleLoader, InvocationTracker,
 * ComputeLogTracker) against an isolated test DB with all pgpm modules
 * deployed. HTTP dispatch goes to a mock function server.
 *
 * NOTE: The worker writes via its own pg.Pool — NOT inside the
 * pgsql-test savepoint. We use per-test unique identifiers and
 * filter queries by invocation_id to avoid cross-test pollution.
 */

import type { PgTestClient } from 'pgsql-test/test-client';

import type { FunctionsTestResult, MockFunctionServer } from '../src';
import { addJob, createMockFunctionServer, createTestWorker, getConnections } from '../src';
import type { TestWorker } from '../src';

let conn: FunctionsTestResult;
let pg: PgTestClient;
let mockServer: MockFunctionServer;
let worker: TestWorker;
let databaseId: string;

const TEST_ACTOR_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01';
const TEST_ORG_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee03';

beforeAll(async () => {
  conn = await getConnections({ modules: 'all+seeds' });
  pg = conn.pg;

  // Get the platform database_id from metaschema
  const dbRow = await pg.oneOrNone<{ id: string }>(
    `SELECT id FROM metaschema_public.database ORDER BY created_at LIMIT 1`
  );
  databaseId = dbRow?.id ?? '00000000-0000-0000-0000-000000000000';

  mockServer = await createMockFunctionServer();
  worker = await createTestWorker(pg, {
    functionUrl: mockServer.url,
    databaseId,
  });

  // Register a test function in platform_function_definitions
  await pg.query(
    `INSERT INTO constructive_compute_public.platform_function_definitions
       (name, task_identifier, service_url, is_invocable, scope)
     VALUES
       ('test-function', 'test-function', $1, true, 'platform')`,
    [mockServer.url]
  );
}, 120_000);

afterAll(async () => {
  if (worker) await worker.close();
  if (mockServer) await mockServer.close();
  if (conn) await conn.teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
  await conn.db.beforeEach();
  mockServer.reset();
  // Invalidate caches so each test gets fresh module config
  worker.loader.invalidateAll();
  worker.discovery.invalidateAll();
});

afterEach(async () => {
  await conn.db.afterEach();
  await pg.afterEach();
});

// ─── GUC Propagation ─────────────────────────────────────────────────────────

describe('GUC propagation', () => {
  it('sets jwt.claims.database_id and user_id within a transaction', async () => {
    // set_config(key, value, true) is transaction-local — must verify
    // within the same transaction on the same connection.
    const client = await worker.pool.connect();
    try {
      await client.query('BEGIN');
      const gucs: [string, string][] = [
        ['jwt.claims.database_id', databaseId],
        ['jwt.claims.user_id', TEST_ACTOR_ID],
      ];
      const sets = gucs.map(([k, v]) => `set_config('${k}', '${v}', true)`).join(', ');
      await client.query(`SELECT ${sets}`);

      const result = await client.query(
        `SELECT current_setting('jwt.claims.database_id', true) AS db_id,
                current_setting('jwt.claims.user_id', true) AS user_id`
      );
      expect(result.rows[0].db_id).toBe(databaseId);
      expect(result.rows[0].user_id).toBe(TEST_ACTOR_ID);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });

  it('sets organization_id GUC within a transaction', async () => {
    const client = await worker.pool.connect();
    try {
      await client.query('BEGIN');
      const gucs: [string, string][] = [
        ['jwt.claims.database_id', databaseId],
        ['jwt.claims.organization_id', TEST_ORG_ID],
      ];
      const sets = gucs.map(([k, v]) => `set_config('${k}', '${v}', true)`).join(', ');
      await client.query(`SELECT ${sets}`);

      const result = await client.query(
        `SELECT current_setting('jwt.claims.organization_id', true) AS org_id`
      );
      expect(result.rows[0].org_id).toBe(TEST_ORG_ID);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });
});

// ─── HTTP Headers ────────────────────────────────────────────────────────────

describe('HTTP dispatch headers', () => {
  it('sends X-Database-Id header', async () => {
    const job = await addJob(pg, 'test-function', { data: 1 });
    await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: { data: 1 },
      database_id: databaseId,
    });

    expect(mockServer.requests).toHaveLength(1);
    expect(mockServer.requests[0].headers['x-database-id']).toBe(databaseId);
  });

  it('sends X-Actor-Id header when actor_id is provided', async () => {
    const job = await addJob(pg, 'test-function', {});
    await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: {},
      database_id: databaseId,
      actor_id: TEST_ACTOR_ID,
    });

    expect(mockServer.requests[0].headers['x-actor-id']).toBe(TEST_ACTOR_ID);
  });

  it('sends X-Organization-Id header when organization_id is provided', async () => {
    const job = await addJob(pg, 'test-function', {});
    await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: {},
      database_id: databaseId,
      organization_id: TEST_ORG_ID,
    });

    expect(mockServer.requests[0].headers['x-organization-id']).toBe(TEST_ORG_ID);
  });

  it('sends X-Worker-Id and X-Job-Id headers', async () => {
    const job = await addJob(pg, 'test-function', {});
    await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: {},
      database_id: databaseId,
    });

    expect(mockServer.requests[0].headers['x-worker-id']).toBe('test-worker');
    expect(mockServer.requests[0].headers['x-job-id']).toBe(String(job.id));
  });

  it('sends the payload as JSON body', async () => {
    const payload = { to: 'test@example.com', subject: 'hello' };
    const job = await addJob(pg, 'test-function', payload);
    await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload,
      database_id: databaseId,
    });

    expect(mockServer.requests[0].body).toEqual(payload);
  });
});

// ─── Invocation Tracking ─────────────────────────────────────────────────────

describe('invocation tracking', () => {
  it('creates an invocation record with status=completed on success', async () => {
    const job = await addJob(pg, 'test-function', { test: true });
    // Platform scope (no entity_id) to avoid org invocation table
    const result = await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: { test: true },
      database_id: databaseId,
      actor_id: TEST_ACTOR_ID,
    });

    expect(result.status).toBe('completed');
    expect(result.invocationId).toBeTruthy();

    // Query via the worker's pool (same DB, outside savepoint)
    const { rows } = await worker.pool.query(
      `SELECT * FROM constructive_compute_public.platform_function_invocations
       WHERE id = $1`,
      [result.invocationId]
    );
    const invocation = rows[0];

    expect(invocation).toBeTruthy();
    expect(invocation.task_identifier).toBe('test-function');
    expect(invocation.status).toBe('completed');
    expect(invocation.actor_id).toBe(TEST_ACTOR_ID);
    expect(invocation.database_id).toBe(databaseId);
    expect(Number(invocation.duration_ms)).toBeGreaterThanOrEqual(0);
  });

  it('creates an invocation record with status=failed on HTTP error', async () => {
    const badWorker = await createTestWorker(pg, {
      functionUrl: 'http://127.0.0.1:1', // connection refused
      databaseId,
    });

    const job = await addJob(pg, 'test-function', {});
    const result = await badWorker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: {},
      database_id: databaseId,
    });

    expect(result.status).toBe('failed');
    expect(result.error).toBeTruthy();

    const { rows } = await badWorker.pool.query(
      `SELECT * FROM constructive_compute_public.platform_function_invocations
       WHERE id = $1`,
      [result.invocationId]
    );
    expect(rows[0].status).toBe('failed');
    expect(rows[0].error).toBeTruthy();

    await badWorker.close();
  });

  it('records duration_ms > 0', async () => {
    mockServer.setResponse({ delayMs: 20 });
    const job = await addJob(pg, 'test-function', {});
    const result = await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: {},
      database_id: databaseId,
    });

    expect(result.durationMs).toBeGreaterThanOrEqual(10);
  });
});

// ─── Compute Log ─────────────────────────────────────────────────────────────

describe('compute_log metering', () => {
  it('writes a compute_log entry on successful dispatch', async () => {
    const job = await addJob(pg, 'test-function', { meter: true });
    // Platform scope only (no entity_id)
    const result = await worker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: { meter: true },
      database_id: databaseId,
      actor_id: TEST_ACTOR_ID,
      organization_id: TEST_ORG_ID,
    });

    const { rows } = await worker.pool.query(
      `SELECT * FROM constructive_compute_public.platform_compute_log
       WHERE invocation_id = $1`,
      [result.invocationId]
    );
    const logRow = rows[0];

    expect(logRow).toBeTruthy();
    expect(logRow.task_identifier).toBe('test-function');
    expect(logRow.status).toBe('completed');
    expect(logRow.database_id).toBe(databaseId);
    expect(logRow.actor_id).toBe(TEST_ACTOR_ID);
    expect(logRow.organization_id).toBe(TEST_ORG_ID);
    expect(Number(logRow.duration_ms)).toBeGreaterThanOrEqual(0);
  });

  it('writes a compute_log entry on failed dispatch', async () => {
    const badWorker = await createTestWorker(pg, {
      functionUrl: 'http://127.0.0.1:1',
      databaseId,
    });

    const job = await addJob(pg, 'test-function', {});
    const result = await badWorker.dispatchJob({
      id: job.id,
      task_identifier: 'test-function',
      payload: {},
      database_id: databaseId,
    });

    const { rows } = await badWorker.pool.query(
      `SELECT * FROM constructive_compute_public.platform_compute_log
       WHERE invocation_id = $1`,
      [result.invocationId]
    );

    expect(rows[0]).toBeTruthy();
    expect(rows[0].status).toBe('failed');
    expect(rows[0].error).toBeTruthy();

    await badWorker.close();
  });
});

// ─── Usage Daily Rollup ──────────────────────────────────────────────────────

describe('usage_daily rollup', () => {
  it('aggregates compute_log into usage_daily via rollup', async () => {
    // Use a unique task_identifier so we only count our rows
    const uniqueTask = `rollup-test-${Date.now()}`;
    await pg.query(
      `INSERT INTO constructive_compute_public.platform_function_definitions
         (name, task_identifier, service_url, is_invocable, scope)
       VALUES ($1, $1, $2, true, 'platform')`,
      [uniqueTask, mockServer.url]
    );

    // Dispatch 3 jobs with the unique task identifier
    const invocationIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const job = await addJob(pg, uniqueTask, { i });
      const result = await worker.dispatchJob({
        id: job.id,
        task_identifier: uniqueTask,
        payload: { i },
        database_id: databaseId,
        actor_id: TEST_ACTOR_ID,
      });
      invocationIds.push(result.invocationId);
    }

    // Verify 3 compute_log entries for our unique task
    const { rows: logRows } = await worker.pool.query(
      `SELECT count(*) FROM constructive_compute_public.platform_compute_log
       WHERE task_identifier = $1`,
      [uniqueTask]
    );
    expect(Number(logRows[0].count)).toBe(3);

    // Run the rollup
    const rowsUpserted = await worker.computeLog.rollup();
    expect(rowsUpserted).toBeGreaterThanOrEqual(1);

    // Verify usage_daily has aggregated data for our unique task
    const { rows: usageRows } = await worker.pool.query(
      `SELECT * FROM constructive_compute_public.platform_usage_daily
       WHERE task_identifier = $1`,
      [uniqueTask]
    );

    expect(usageRows).toHaveLength(1);
    expect(Number(usageRows[0].total_calls)).toBe(3);
    expect(Number(usageRows[0].successful)).toBe(3);
    expect(Number(usageRows[0].failed)).toBe(0);
    expect(Number(usageRows[0].total_duration_ms)).toBeGreaterThanOrEqual(0);
  });
});
