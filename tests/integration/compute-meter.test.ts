/**
 * Integration tests for compute metering (fire-and-forget usage logging).
 *
 * Verifies that logComputeUsage:
 *   1. INSERTs into platform_function_invocations with correct columns
 *   2. INSERTs into platform_usage_log_computes linked via invocation_id
 *   3. Never throws — metering errors are swallowed
 *   4. Captures duration_ms, status, database_id, entity_id, actor_id
 *   5. Works for both inline (FBP) and HTTP (cloud function) dispatch types
 *   6. Handles graph execution context (execution_id)
 */

import { logComputeUsage } from '../../job/worker/src/compute-meter';

/** Wait for fire-and-forget promises to settle */
const flush = () => new Promise((r) => setTimeout(r, 20));

describe('logComputeUsage', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    mockPool = { query: mockQuery } as any;
  });

  it('inserts into both invocations and usage_log tables', async () => {
    logComputeUsage(mockPool, {
      jobId: 42,
      taskIdentifier: 'add',
      databaseId: 'db-001',
      actorId: 'actor-001',
      entityId: 'entity-001',
      durationMs: 1.5,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    // 3 calls: 1 config resolution (metaschema) + 2 inserts (invocations + usage)
    expect(mockQuery).toHaveBeenCalledTimes(3);

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    const usageCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_usage_log_computes')
    );

    expect(invocationCall).toBeDefined();
    expect(usageCall).toBeDefined();
  });

  it('passes correct columns to platform_function_invocations', async () => {
    logComputeUsage(mockPool, {
      jobId: 100,
      taskIdentifier: 'send-email',
      databaseId: 'db-aaa',
      actorId: 'actor-bbb',
      entityId: 'entity-ccc',
      durationMs: 250.7,
      status: 'ok',
      payload: { to: 'test@example.com' },
      result: { sent: true },
      dispatchType: 'http'
    });
    await flush();

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    expect(invocationCall).toBeDefined();

    const [sql, params] = invocationCall!;
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('database_id');
    expect(sql).toContain('actor_id');
    expect(sql).toContain('task_identifier');
    expect(sql).toContain('duration_ms');
    expect(sql).toContain('status');

    // params: [id, database_id, actor_id, task_identifier, job_id,
    //          graph_execution_id, status, duration_ms,
    //          started_at, completed_at, payload, result, error, created_at]
    expect(params[1]).toBe('db-aaa');        // database_id
    expect(params[2]).toBe('actor-bbb');     // actor_id
    expect(params[3]).toBe('send-email');    // task_identifier
    expect(params[4]).toBe(100);             // job_id
    expect(params[5]).toBeNull();            // graph_execution_id (no graph)
    expect(params[6]).toBe('ok');            // status
    expect(params[7]).toBe(251);             // duration_ms (rounded)
    expect(params[8]).toBeInstanceOf(Date);  // started_at
    expect(params[9]).toBeInstanceOf(Date);  // completed_at
    expect(JSON.parse(params[10])).toEqual({ to: 'test@example.com' }); // payload
    expect(JSON.parse(params[11])).toEqual({ sent: true });              // result
    expect(params[12]).toBeNull();           // error
  });

  it('passes correct columns to platform_usage_log_computes', async () => {
    logComputeUsage(mockPool, {
      jobId: 200,
      taskIdentifier: 'multiply',
      databaseId: 'db-xyz',
      actorId: 'actor-xyz',
      entityId: 'entity-xyz',
      durationMs: 0.3,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    const usageCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_usage_log_computes')
    );
    expect(usageCall).toBeDefined();

    const [sql, params] = usageCall!;
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('entity_id');
    expect(sql).toContain('invocation_id');

    // params: [id, database_id, entity_id, actor_id, task_identifier,
    //          job_id, invocation_id, status, duration_ms, error, completed_at]
    expect(params[1]).toBe('db-xyz');       // database_id
    expect(params[2]).toBe('entity-xyz');   // entity_id
    expect(params[3]).toBe('actor-xyz');    // actor_id
    expect(params[4]).toBe('multiply');     // task_identifier
    expect(params[5]).toBe(200);            // job_id
    expect(params[6]).toBeDefined();        // invocation_id (UUID)
    expect(params[7]).toBe('ok');           // status
    expect(params[8]).toBe(0);              // duration_ms (rounded)
    expect(params[9]).toBeNull();           // error
  });

  it('links usage_log invocation_id to invocations table id', async () => {
    logComputeUsage(mockPool, {
      jobId: 1,
      taskIdentifier: 'add',
      durationMs: 5,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    const usageCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_usage_log_computes')
    );

    // The invocation id (params[0]) should match the usage log's invocation_id (params[6])
    const invocationId = invocationCall![1][0];
    const usageInvocationId = usageCall![1][6];
    expect(invocationId).toBe(usageInvocationId);
  });

  it('includes graph_execution_id for graph jobs', async () => {
    logComputeUsage(mockPool, {
      jobId: 10,
      taskIdentifier: 'add',
      databaseId: 'db-graph',
      durationMs: 0.1,
      status: 'ok',
      graphExecutionId: '11111111-1111-1111-1111-111111111111',
      nodeName: 'add_1',
      dispatchType: 'inline'
    });
    await flush();

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    expect(invocationCall![1][5]).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('records error status and message for failed jobs', async () => {
    logComputeUsage(mockPool, {
      jobId: 50,
      taskIdentifier: 'select',
      databaseId: 'db-err',
      durationMs: 12,
      status: 'error',
      error: 'Cannot read property x of null',
      dispatchType: 'inline'
    });
    await flush();

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    expect(invocationCall![1][6]).toBe('error'); // status
    expect(invocationCall![1][12]).toBe('Cannot read property x of null'); // error

    const usageCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_usage_log_computes')
    );
    expect(usageCall![1][7]).toBe('error');
    expect(usageCall![1][9]).toBe('Cannot read property x of null');
  });

  it('handles null database_id, entity_id, actor_id gracefully', async () => {
    logComputeUsage(mockPool, {
      jobId: 99,
      taskIdentifier: 'number',
      durationMs: 0,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    // 3 calls: 1 config resolution (metaschema) + 2 inserts
    expect(mockQuery).toHaveBeenCalledTimes(3);

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    expect(invocationCall![1][1]).toBeNull(); // database_id
    expect(invocationCall![1][2]).toBeNull(); // actor_id

    const usageCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_usage_log_computes')
    );
    expect(usageCall![1][1]).toBeNull(); // database_id
    expect(usageCall![1][2]).toBeNull(); // entity_id
    expect(usageCall![1][3]).toBeNull(); // actor_id
  });

  it('never throws even when pool.query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    // Should not throw
    expect(() => {
      logComputeUsage(mockPool, {
        jobId: 1,
        taskIdentifier: 'add',
        durationMs: 1,
        status: 'ok',
        dispatchType: 'inline'
      });
    }).not.toThrow();

    await flush();
    // All calls were attempted (config + 2 inserts), all rejected, but no crash
    expect(mockQuery).toHaveBeenCalledTimes(3);
  });

  it('parses string job IDs to integers', async () => {
    logComputeUsage(mockPool, {
      jobId: 'job-777',
      taskIdentifier: 'template',
      durationMs: 2,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    // 'job-777' can't parse to int, so defaults to 0
    expect(invocationCall![1][4]).toBe(0);
  });

  it('rounds duration_ms to nearest integer', async () => {
    logComputeUsage(mockPool, {
      jobId: 1,
      taskIdentifier: 'add',
      durationMs: 3.7,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    const invocationCall = mockQuery.mock.calls.find(
      ([sql]: [string]) => sql.includes('platform_function_invocations')
    );
    expect(invocationCall![1][7]).toBe(4); // Math.round(3.7)
  });
});
