/**
 * Graph execution integration tests.
 *
 * Tests the full FBP pipeline: import graph → start execution →
 * compute-worker dispatches each node → complete_node cascades →
 * graph completes with output.
 *
 * Uses real graph SQL procedures (import_graph_json, start_execution,
 * tick_execution, complete_node) against an isolated test DB.
 * HTTP dispatch goes to mock function servers.
 *
 * NOTE: Both graph SQL procedures (SECURITY DEFINER) and the worker
 * pool write outside the pgsql-test savepoint. We use per-test
 * unique graph names and filter by execution_id to avoid collision.
 */

import type { FunctionsTestResult, MockFunctionServer, TestWorker, GraphJob } from '../src';
import {
  getConnections,
  createMockFunctionServer,
  createTestWorker,
  importGraphJson,
  startExecution,
  getExecution,
  getGraphJobs,
  registerFunction,
  buildCalculatorGraph,
  buildParallelGraph,
} from '../src';

jest.setTimeout(120_000);

let ctx: FunctionsTestResult;
let addServer: MockFunctionServer;
let doubleServer: MockFunctionServer;
let tripleServer: MockFunctionServer;
let mergeServer: MockFunctionServer;
let worker: TestWorker;
let databaseId: string;

beforeAll(async () => {
  ctx = await getConnections({ modules: 'all+seeds' });

  const dbRow = await ctx.pg.oneOrNone<{ id: string }>(
    `SELECT id FROM metaschema_public.database ORDER BY created_at LIMIT 1`
  );
  databaseId = dbRow?.id ?? '00000000-0000-0000-0000-000000000000';

  addServer = await createMockFunctionServer({ responseBody: { result: 8 } });
  doubleServer = await createMockFunctionServer({ responseBody: { result: 16 } });
  tripleServer = await createMockFunctionServer({ responseBody: { result: 15 } });
  mergeServer = await createMockFunctionServer({ responseBody: { result: 25 } });

  worker = await createTestWorker(ctx.pg, {
    functionUrl: addServer.url,
    functionUrlMap: {
      add: addServer.url,
      double: doubleServer.url,
      triple: tripleServer.url,
      merge: mergeServer.url,
    },
    databaseId,
  });

  // Register functions once (visible to worker pool and graph SQL)
  await registerFunction(ctx.pg, databaseId, 'add', addServer.url);
  await registerFunction(ctx.pg, databaseId, 'double', doubleServer.url);
  await registerFunction(ctx.pg, databaseId, 'triple', tripleServer.url);
  await registerFunction(ctx.pg, databaseId, 'merge', mergeServer.url);
});

afterAll(async () => {
  if (worker) await worker.close();
  if (addServer) await addServer.close();
  if (doubleServer) await doubleServer.close();
  if (tripleServer) await tripleServer.close();
  if (mergeServer) await mergeServer.close();
  if (ctx) await ctx.teardown();
});

beforeEach(() => {
  addServer.reset();
  doubleServer.reset();
  tripleServer.reset();
  mergeServer.reset();
});

// ─── Graph infrastructure tests ────────────────────────────────────────

describe('graph infrastructure', () => {
  test('graph tables exist', async () => {
    for (const t of ['platform_function_graphs', 'platform_function_definitions']) {
      const row = await ctx.pg.oneOrNone(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'constructive_compute_public' AND table_name = $1`,
        [t]
      );
      expect(row).toBeTruthy();
    }
  });

  test('graph execution tables exist', async () => {
    for (const t of ['platform_function_graph_executions', 'platform_function_graph_execution_outputs']) {
      const row = await ctx.pg.oneOrNone(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'constructive_compute_private' AND table_name = $1`,
        [t]
      );
      expect(row).toBeTruthy();
    }
  });

  test('merkle store tables exist', async () => {
    for (const t of ['platform_function_graph_ref', 'platform_function_graph_commit', 'platform_function_graph_object', 'platform_function_graph_store']) {
      const row = await ctx.pg.oneOrNone(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'constructive_platform_function_graph_public' AND table_name = $1`,
        [t]
      );
      expect(row).toBeTruthy();
    }
  });

  test('graph procedures exist', async () => {
    const procs = [
      { schema: 'constructive_compute_public', name: 'platform_start_execution' },
      { schema: 'constructive_compute_public', name: 'platform_import_graph_json' },
      { schema: 'constructive_compute_private', name: 'platform_tick_execution' },
      { schema: 'constructive_compute_private', name: 'platform_complete_node' },
    ];
    for (const p of procs) {
      const row = await ctx.pg.oneOrNone(
        `SELECT 1 FROM information_schema.routines
         WHERE routine_schema = $1 AND routine_name = $2`,
        [p.schema, p.name]
      );
      expect(row).toBeTruthy();
    }
  });
});

// ─── Graph import and start execution ──────────────────────────────────

describe('graph import and execution', () => {
  test('import a graph from JSON', async () => {
    const graphJson = buildCalculatorGraph();
    const graphId = await importGraphJson(ctx.pg, databaseId, 'test-import', graphJson);
    expect(graphId).toBeTruthy();

    const graph = await ctx.pg.oneOrNone(
      `SELECT * FROM constructive_compute_public.platform_function_graphs WHERE id = $1`,
      [graphId]
    );
    expect(graph).toBeTruthy();
    expect(graph.name).toBe('test-import');
    expect(graph.context).toBe('function');
  });

  test('start execution seeds boundary nodes and enqueues jobs', async () => {
    const graphJson = buildCalculatorGraph();
    const graphId = await importGraphJson(ctx.pg, databaseId, 'test-start', graphJson);

    const execId = await startExecution(ctx.pg, graphId, { a: 5, b: 3 });
    expect(execId).toBeTruthy();

    const exec = await getExecution(ctx.pg, execId);
    expect(exec).toBeTruthy();
    expect(exec!.status).toBe('running');
    expect(exec!.input_payload).toEqual({ a: 5, b: 3 });

    // graphInputs seeded → add_node should be enqueued (both inputs ready)
    const jobs = await getGraphJobs(ctx.pg, execId);
    expect(jobs.length).toBeGreaterThanOrEqual(1);

    const addJob = jobs.find((j: GraphJob) => j.payload.node_type === 'add');
    expect(addJob).toBeTruthy();
    expect(addJob!.payload.inputs).toEqual({ a: 5, b: 3 });
    expect(addJob!.payload.node_name).toBe('add_node');

    // Cleanup enqueued jobs
    await ctx.pg.query(
      `DELETE FROM app_jobs.jobs WHERE (payload::jsonb->>'execution_id')::uuid = $1::uuid`,
      [execId]
    );
  });
});

// ─── Full calculator flow ──────────────────────────────────────────────

describe('calculator flow: graphInput → add → double → graphOutput', () => {
  test('full pipeline: dispatch nodes via worker, verify completion', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'calc-full', buildCalculatorGraph());

    addServer.setResponse({ responseBody: { result: 8 } });
    doubleServer.setResponse({ responseBody: { result: 16 } });

    const execId = await startExecution(ctx.pg, graphId, { a: 5, b: 3 });

    // Wave 1: add_node
    let jobs = await getGraphJobs(ctx.pg, execId);
    const addJob = jobs.find((j: GraphJob) => j.payload.node_type === 'add');
    expect(addJob).toBeTruthy();

    const addResult = await worker.dispatchJob({
      id: addJob!.id,
      task_identifier: addJob!.task_identifier,
      payload: addJob!.payload as any,
      database_id: databaseId,
    });
    expect(addResult.status).toBe('completed');
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [addJob!.id]);

    // Verify add server received correct inputs
    expect(addServer.requests).toHaveLength(1);
    expect(addServer.requests[0].body).toEqual({ a: 5, b: 3 });
    expect(addServer.requests[0].headers['x-execution-id']).toBe(execId);
    expect(addServer.requests[0].headers['x-node-name']).toBe('add_node');

    // Wave 2: double_node (cascaded by complete_node after add)
    jobs = await getGraphJobs(ctx.pg, execId);
    const doubleJob = jobs.find((j: GraphJob) => j.payload.node_type === 'double');
    expect(doubleJob).toBeTruthy();
    expect(doubleJob!.payload.inputs).toEqual({ value: 8 });

    const doubleResult = await worker.dispatchJob({
      id: doubleJob!.id,
      task_identifier: doubleJob!.task_identifier,
      payload: doubleJob!.payload as any,
      database_id: databaseId,
    });
    expect(doubleResult.status).toBe('completed');
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [doubleJob!.id]);

    // Verify double server received correct input
    expect(doubleServer.requests).toHaveLength(1);
    expect(doubleServer.requests[0].body).toEqual({ value: 8 });

    // Execution should be completed with final output
    const finalExec = await getExecution(ctx.pg, execId);
    expect(finalExec).toBeTruthy();
    expect(finalExec!.status).toBe('completed');
    expect(finalExec!.output_payload).toEqual({ value: 16 });
  });

  test('per-node invocation tracking', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'calc-invocations', buildCalculatorGraph());

    addServer.setResponse({ responseBody: { result: 10 } });
    doubleServer.setResponse({ responseBody: { result: 20 } });

    const execId = await startExecution(ctx.pg, graphId, { a: 7, b: 3 });

    // Process add
    let jobs = await getGraphJobs(ctx.pg, execId);
    const addJob = jobs.find((j: GraphJob) => j.payload.node_type === 'add')!;
    const addDispatch = await worker.dispatchJob({
      id: addJob.id,
      task_identifier: addJob.task_identifier,
      payload: addJob.payload as any,
      database_id: databaseId,
    });
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [addJob.id]);

    // Process double
    jobs = await getGraphJobs(ctx.pg, execId);
    const doubleJob = jobs.find((j: GraphJob) => j.payload.node_type === 'double')!;
    const doubleDispatch = await worker.dispatchJob({
      id: doubleJob.id,
      task_identifier: doubleJob.task_identifier,
      payload: doubleJob.payload as any,
      database_id: databaseId,
    });
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [doubleJob.id]);

    // Verify invocations via invocationId from dispatch results
    const addInv = await ctx.pg.oneOrNone(
      `SELECT * FROM constructive_compute_public.platform_function_invocations WHERE id = $1`,
      [addDispatch.invocationId]
    );
    expect(addInv).toBeTruthy();
    expect(addInv.task_identifier).toBe('add');
    expect(addInv.status).toBe('completed');

    const doubleInv = await ctx.pg.oneOrNone(
      `SELECT * FROM constructive_compute_public.platform_function_invocations WHERE id = $1`,
      [doubleDispatch.invocationId]
    );
    expect(doubleInv).toBeTruthy();
    expect(doubleInv.task_identifier).toBe('double');
    expect(doubleInv.status).toBe('completed');
  });

  test('per-node compute log entries', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'calc-logs', buildCalculatorGraph());

    addServer.setResponse({ responseBody: { result: 6 } });
    doubleServer.setResponse({ responseBody: { result: 12 } });

    const execId = await startExecution(ctx.pg, graphId, { a: 4, b: 2 });

    // Process add
    let jobs = await getGraphJobs(ctx.pg, execId);
    const addJob = jobs.find((j: GraphJob) => j.payload.node_type === 'add')!;
    const addDispatch = await worker.dispatchJob({
      id: addJob.id,
      task_identifier: addJob.task_identifier,
      payload: addJob.payload as any,
      database_id: databaseId,
    });
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [addJob.id]);

    // Process double
    jobs = await getGraphJobs(ctx.pg, execId);
    const doubleJob = jobs.find((j: GraphJob) => j.payload.node_type === 'double')!;
    const doubleDispatch = await worker.dispatchJob({
      id: doubleJob.id,
      task_identifier: doubleJob.task_identifier,
      payload: doubleJob.payload as any,
      database_id: databaseId,
    });
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [doubleJob.id]);

    // Verify compute log entries by invocation_id
    const addLog = await ctx.pg.oneOrNone(
      `SELECT * FROM constructive_compute_public.platform_compute_log WHERE invocation_id = $1`,
      [addDispatch.invocationId]
    );
    expect(addLog).toBeTruthy();
    expect(addLog.status).toBe('completed');
    expect(addLog.duration_ms).toBeGreaterThan(0);

    const doubleLog = await ctx.pg.oneOrNone(
      `SELECT * FROM constructive_compute_public.platform_compute_log WHERE invocation_id = $1`,
      [doubleDispatch.invocationId]
    );
    expect(doubleLog).toBeTruthy();
    expect(doubleLog.status).toBe('completed');
    expect(doubleLog.duration_ms).toBeGreaterThan(0);
  });
});

// ─── Failure propagation ───────────────────────────────────────────────

describe('graph failure propagation', () => {
  test('node failure marks execution as failed', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'calc-fail', buildCalculatorGraph());

    addServer.setResponse({ statusCode: 500, responseBody: { error: 'kaboom' } });

    const execId = await startExecution(ctx.pg, graphId, { a: 5, b: 3 });

    const jobs = await getGraphJobs(ctx.pg, execId);
    const addJob = jobs.find((j: GraphJob) => j.payload.node_type === 'add');
    expect(addJob).toBeTruthy();

    const result = await worker.dispatchJob({
      id: addJob!.id,
      task_identifier: addJob!.task_identifier,
      payload: addJob!.payload as any,
      database_id: databaseId,
    });
    expect(result.status).toBe('failed');

    // Cleanup the job
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [addJob!.id]);

    const exec = await getExecution(ctx.pg, execId);
    expect(exec).toBeTruthy();
    expect(exec!.status).toBe('failed');
    expect(exec!.error_message).toBeTruthy();
  });
});

// ─── Safety limits ─────────────────────────────────────────────────────

describe('graph safety limits', () => {
  test('max_ticks exceeded fails execution', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'calc-limit', buildCalculatorGraph());

    addServer.setResponse({ statusCode: 200, responseBody: { result: 8 } });
    doubleServer.setResponse({ statusCode: 200, responseBody: { result: 16 } });

    // max_ticks=1: start_execution fires tick 0 (tick_count becomes 1),
    // complete_node fires tick_execution again → tick_count(1) >= max_ticks(1) → TICK_LIMIT_EXCEEDED
    const execId = await startExecution(ctx.pg, graphId, { a: 5, b: 3 }, { maxTicks: 1 });

    const jobs = await getGraphJobs(ctx.pg, execId);
    const addJob = jobs.find((j: GraphJob) => j.payload.node_type === 'add');
    expect(addJob).toBeTruthy();

    await worker.dispatchJob({
      id: addJob!.id,
      task_identifier: addJob!.task_identifier,
      payload: addJob!.payload as any,
      database_id: databaseId,
    });
    await ctx.pg.query(`DELETE FROM app_jobs.jobs WHERE id = $1`, [addJob!.id]);

    const exec = await getExecution(ctx.pg, execId);
    expect(exec).toBeTruthy();
    expect(exec!.status).toBe('failed');
    expect(exec!.error_code).toBe('TICK_LIMIT_EXCEEDED');

    // Clean up remaining jobs
    await ctx.pg.query(
      `DELETE FROM app_jobs.jobs WHERE (payload::jsonb->>'execution_id')::uuid = $1::uuid`,
      [execId]
    );
  });
});

// ─── End-to-end auto-dispatch ──────────────────────────────────────────

describe('e2e auto-dispatch via runToCompletion', () => {
  test('calculator flow completes automatically', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'e2e-calc', buildCalculatorGraph());

    addServer.setResponse({ responseBody: { result: 8 } });
    doubleServer.setResponse({ responseBody: { result: 16 } });

    const execId = await startExecution(ctx.pg, graphId, { a: 5, b: 3 });

    const result = await worker.runToCompletion(ctx.pg, execId);

    expect(result.status).toBe('completed');
    expect(result.totalJobsProcessed).toBe(2); // add + double
    expect(result.waves).toBe(2);
    expect(result.output).toEqual({ value: 16 });

    // Verify both servers were called
    expect(addServer.requests).toHaveLength(1);
    expect(doubleServer.requests).toHaveLength(1);
  });

  test('failure stops execution automatically', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'e2e-fail', buildCalculatorGraph());

    addServer.setResponse({ statusCode: 500, responseBody: { error: 'boom' } });

    const execId = await startExecution(ctx.pg, graphId, { a: 1, b: 2 });

    const result = await worker.runToCompletion(ctx.pg, execId);

    expect(result.status).toBe('failed');
    expect(result.totalJobsProcessed).toBe(1);
    expect(result.error).toBeTruthy();
    expect(doubleServer.requests).toHaveLength(0);
  });

  test('full metering pipeline per node', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'e2e-meter', buildCalculatorGraph());

    addServer.setResponse({ responseBody: { result: 100 } });
    doubleServer.setResponse({ responseBody: { result: 200 } });

    const execId = await startExecution(ctx.pg, graphId, { a: 50, b: 50 });

    const result = await worker.runToCompletion(ctx.pg, execId);
    expect(result.status).toBe('completed');

    // Query invocations directly (jobs are deleted after processing)
    const { rows: allInvocations } = await ctx.pg.query(
      `SELECT task_identifier, status FROM constructive_compute_public.platform_function_invocations
       ORDER BY created_at DESC LIMIT 10`
    );
    const addInv = allInvocations.find((i: any) => i.task_identifier === 'add');
    const doubleInv = allInvocations.find((i: any) => i.task_identifier === 'double');
    expect(addInv).toBeTruthy();
    expect(addInv.status).toBe('completed');
    expect(doubleInv).toBeTruthy();
    expect(doubleInv.status).toBe('completed');

    // Verify compute log entries
    const { rows: logs } = await ctx.pg.query(
      `SELECT task_identifier, status, duration_ms FROM constructive_compute_public.platform_compute_log
       ORDER BY completed_at DESC LIMIT 10`
    );
    const addLog = logs.find((l: any) => l.task_identifier === 'add');
    const doubleLog = logs.find((l: any) => l.task_identifier === 'double');
    expect(addLog).toBeTruthy();
    expect(addLog.status).toBe('completed');
    expect(addLog.duration_ms).toBeGreaterThan(0);
    expect(doubleLog).toBeTruthy();
    expect(doubleLog.status).toBe('completed');
  });
});

// ─── Parallel branches ─────────────────────────────────────────────────

describe('parallel branch execution', () => {
  test('parallel branches dispatch concurrently, merge waits for both', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'parallel-basic', buildParallelGraph());

    // x=5: double→10, triple→15, merge→25
    doubleServer.setResponse({ responseBody: { result: 10 } });
    tripleServer.setResponse({ responseBody: { result: 15 } });
    mergeServer.setResponse({ responseBody: { result: 25 } });

    const execId = await startExecution(ctx.pg, graphId, { x: 5 });

    const result = await worker.runToCompletion(ctx.pg, execId);

    expect(result.status).toBe('completed');
    expect(result.totalJobsProcessed).toBe(3); // double + triple + merge
    expect(result.output).toEqual({ value: 25 });

    // Both double and triple should have been called
    expect(doubleServer.requests).toHaveLength(1);
    expect(tripleServer.requests).toHaveLength(1);
    expect(mergeServer.requests).toHaveLength(1);

    // Verify double received {value: 5}
    expect(doubleServer.requests[0].body).toEqual({ value: 5 });
    // Verify triple received {value: 5}
    expect(tripleServer.requests[0].body).toEqual({ value: 5 });
    // Verify merge received both inputs
    expect(mergeServer.requests[0].body).toEqual({ a: 10, b: 15 });
  });

  test('parallel branch failure fails the execution', async () => {
    const graphId = await importGraphJson(ctx.pg, databaseId, 'parallel-fail', buildParallelGraph());

    doubleServer.setResponse({ responseBody: { result: 10 } });
    tripleServer.setResponse({ statusCode: 500, responseBody: { error: 'triple failed' } });

    const execId = await startExecution(ctx.pg, graphId, { x: 5 });

    const result = await worker.runToCompletion(ctx.pg, execId);

    expect(result.status).toBe('failed');
    // double succeeded, triple failed
    expect(doubleServer.requests).toHaveLength(1);
    expect(tripleServer.requests).toHaveLength(1);
    // merge should never have been called
    expect(mergeServer.requests).toHaveLength(0);
  });
});
