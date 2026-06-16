/**
 * Integration tests for compute metering (fire-and-forget usage logging).
 *
 * Verifies that logComputeUsage:
 *   1. Resolves table names via ModuleLoader (metaschema query)
 *   2. INSERTs into the resolved invocations table with correct columns
 *   3. Never throws — metering errors are swallowed
 *   4. Captures duration_ms, status, database_id, entity_id, actor_id
 *   5. Works for both inline (FBP) and HTTP (cloud function) dispatch types
 *   6. Handles graph execution context (execution_id)
 *   7. Returns early when databaseId is missing (no queries)
 */

import { logComputeUsage } from '../../job/worker/src/compute-meter';
import { createModuleMockQuery, MODULE_CONFIGS } from './helpers/module-mock';

/** Wait for fire-and-forget promises to settle */
const flush = () => new Promise((r) => setTimeout(r, 20));

/** Filter query calls to only INSERT statements for invocations table */
function invocationInserts(mockQuery: jest.Mock) {
  return mockQuery.mock.calls.filter(
    ([sql]: [string]) =>
      sql.includes('INSERT INTO') &&
      sql.includes(MODULE_CONFIGS.invocation.invocations_table_name)
  );
}

describe('logComputeUsage', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    mockQuery = createModuleMockQuery();
    mockPool = { query: mockQuery } as any;
  });

  it('resolves table names from MetaSchema and inserts into invocations', async () => {
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

    // 1 metaschema lookup + 1 INSERT
    expect(mockQuery).toHaveBeenCalledTimes(2);

    const inserts = invocationInserts(mockQuery);
    expect(inserts).toHaveLength(1);
  });

  it('passes correct columns to invocations table', async () => {
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

    const inserts = invocationInserts(mockQuery);
    expect(inserts).toHaveLength(1);

    const [sql, params] = inserts[0];
    expect(sql).toContain('INSERT INTO');
    expect(sql).toContain('database_id');
    expect(sql).toContain('actor_id');
    expect(sql).toContain('task_identifier');
    expect(sql).toContain('duration_ms');
    expect(sql).toContain('status');

    // params: [id, database_id, actor_id, task_identifier, job_id,
    //          graph_execution_id, status, duration_ms,
    //          started_at, completed_at, payload, result, error,
    //          entity_id, node_name, dispatch_type]
    expect(params[1]).toBe('db-aaa');        // database_id
    expect(params[2]).toBe('actor-bbb');     // actor_id
    expect(params[3]).toBe('send-email');    // task_identifier
    expect(params[4]).toBe('100');           // job_id (stringified)
    expect(params[5]).toBeNull();            // graph_execution_id (no graph)
    expect(params[6]).toBe('ok');            // status
    expect(params[7]).toBe(251);             // duration_ms (rounded)
    expect(params[8]).toBeInstanceOf(Date);  // started_at
    expect(params[9]).toBeInstanceOf(Date);  // completed_at
    expect(JSON.parse(params[10])).toEqual({ to: 'test@example.com' }); // payload
    expect(JSON.parse(params[11])).toEqual({ sent: true });              // result
    expect(params[12]).toBeNull();           // error
    expect(params[13]).toBe('entity-ccc');   // entity_id
    expect(params[14]).toBeNull();           // node_name
    expect(params[15]).toBe('http');         // dispatch_type
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

    const inserts = invocationInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    expect(inserts[0][1][5]).toBe('11111111-1111-1111-1111-111111111111');
    expect(inserts[0][1][14]).toBe('add_1'); // node_name
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

    const inserts = invocationInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    expect(inserts[0][1][6]).toBe('error'); // status
    expect(inserts[0][1][12]).toBe('Cannot read property x of null'); // error
  });

  it('returns early with no queries when databaseId is missing', async () => {
    logComputeUsage(mockPool, {
      jobId: 99,
      taskIdentifier: 'number',
      durationMs: 0,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    // No queries — databaseId is undefined so it returns early
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('never throws even when pool.query rejects', async () => {
    mockQuery.mockRejectedValue(new Error('connection refused'));

    expect(() => {
      logComputeUsage(mockPool, {
        jobId: 1,
        taskIdentifier: 'add',
        databaseId: 'db-reject',
        durationMs: 1,
        status: 'ok',
        dispatchType: 'inline'
      });
    }).not.toThrow();

    await flush();
  });

  it('stores job_id as string', async () => {
    logComputeUsage(mockPool, {
      jobId: 777,
      taskIdentifier: 'template',
      databaseId: 'db-str',
      durationMs: 2,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    const inserts = invocationInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    expect(inserts[0][1][4]).toBe('777');
  });

  it('rounds duration_ms to nearest integer', async () => {
    logComputeUsage(mockPool, {
      jobId: 1,
      taskIdentifier: 'add',
      databaseId: 'db-round',
      durationMs: 3.7,
      status: 'ok',
      dispatchType: 'inline'
    });
    await flush();

    const inserts = invocationInserts(mockQuery);
    expect(inserts).toHaveLength(1);
    expect(inserts[0][1][7]).toBe(4); // Math.round(3.7)
  });

  it('returns unique invocation_id for each call', () => {
    const id1 = logComputeUsage(mockPool, {
      jobId: 1,
      taskIdentifier: 'a',
      databaseId: 'db-1',
      durationMs: 1,
      status: 'ok',
      dispatchType: 'inline'
    });
    const id2 = logComputeUsage(mockPool, {
      jobId: 2,
      taskIdentifier: 'b',
      databaseId: 'db-2',
      durationMs: 1,
      status: 'ok',
      dispatchType: 'inline'
    });
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f-]{36}$/);
    expect(id2).toMatch(/^[0-9a-f-]{36}$/);
  });
});
