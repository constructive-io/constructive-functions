/**
 * Integration tests for the Worker's inline node dispatch.
 *
 * Verifies that when a graph job arrives with a task_identifier matching
 * a native FBP node (e.g. "add"), the worker:
 *   1. Executes the impl in-process (no HTTP)
 *   2. Calls complete_node via SQL to advance the graph
 *   3. Logs compute usage to both metering tables (fire-and-forget)
 *   4. Falls through to HTTP dispatch for unknown task identifiers
 */

jest.mock('../../job/worker/src/req', () => ({
  request: jest.fn().mockResolvedValue(true)
}));

jest.mock('@constructive-io/job-utils', () => ({
  getJobSupportAny: jest.fn(() => true),
  getJob: jest.fn(),
  releaseJobs: jest.fn(),
  failJob: jest.fn(),
  completeJob: jest.fn(),
  getCallbackBaseUrl: jest.fn(() => 'http://localhost:8080'),
  getJobGatewayConfig: jest.fn(() => ({ gatewayUrl: 'http://localhost:9090' })),
  getJobGatewayDevMap: jest.fn(() => null),
  getNodeEnvironment: jest.fn(() => 'test')
}));

jest.mock('@constructive-io/job-pg', () => ({
  getPool: jest.fn(() => mockPool),
  onClose: jest.fn()
}));

const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
const mockPool = {
  query: mockQuery,
  connect: jest.fn().mockResolvedValue({
    release: jest.fn(),
    on: jest.fn(),
    query: jest.fn(),
    removeAllListeners: jest.fn()
  }),
  on: jest.fn()
} as any;

import { Worker } from '../../job/worker/src/index';
import { request as mockRequest } from '../../job/worker/src/req';

/** Wait for fire-and-forget metering promises to settle */
const flushMeter = () => new Promise((r) => setTimeout(r, 10));

/** Filter mockQuery calls to only graph-engine SQL (not metering) */
const graphCalls = () =>
  mockQuery.mock.calls.filter(
    ([sql]: [string]) =>
      sql.includes('platform_complete_node') ||
      sql.includes('platform_fail_node')
  );

/** Filter mockQuery calls to metering INSERTs */
const meterCalls = () =>
  mockQuery.mock.calls.filter(
    ([sql]: [string]) =>
      sql.includes('platform_function_invocations') ||
      sql.includes('platform_usage_log_computes')
  );

describe('Worker inline node dispatch', () => {
  let worker: InstanceType<typeof Worker>;

  beforeEach(() => {
    jest.clearAllMocks();
    worker = new Worker({
      tasks: ['send-email', 'add', 'number'],
      pgPool: mockPool,
      workerId: 'test-worker'
    });
  });

  afterEach(async () => {
    await worker.stop();
  });

  it('executes inline node and calls complete_node SQL', async () => {
    await worker.doWork({
      id: 'job-1',
      task_identifier: 'add',
      payload: {
        execution_id: '00000000-0000-0000-0000-000000000001',
        node_name: 'add_1',
        node_type: 'add',
        inputs: { a: 3, b: 7 }
      },
      database_id: 'db-123'
    });
    await flushMeter();

    expect(mockRequest).not.toHaveBeenCalled();

    const gc = graphCalls();
    expect(gc).toHaveLength(1);
    const [sql, params] = gc[0];
    expect(sql).toContain('platform_complete_node');
    expect(params[0]).toBe('00000000-0000-0000-0000-000000000001');
    expect(params[1]).toBe('add_1');
    expect(JSON.parse(params[2])).toEqual({ sum: 10 });
  });

  it('executes const/number node with props', async () => {
    await worker.doWork({
      id: 'job-2',
      task_identifier: 'number',
      payload: {
        execution_id: '00000000-0000-0000-0000-000000000002',
        node_name: 'num_1',
        node_type: 'number',
        inputs: {},
        props: [{ name: 'value', value: 42 }]
      },
      database_id: 'db-123'
    });
    await flushMeter();

    expect(mockRequest).not.toHaveBeenCalled();
    const gc = graphCalls();
    expect(gc).toHaveLength(1);
    const [, params] = gc[0];
    expect(JSON.parse(params[2])).toEqual({ value: 42 });
  });

  it('falls through to HTTP for cloud functions and meters the call', async () => {
    await worker.doWork({
      id: 'job-3',
      task_identifier: 'send-email',
      payload: {
        to: 'test@example.com',
        subject: 'hello'
      },
      database_id: 'db-123'
    });
    await flushMeter();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(graphCalls()).toHaveLength(0);

    // HTTP path should also produce metering entries
    const mc = meterCalls();
    expect(mc).toHaveLength(2); // invocations + usage_log
  });

  it('falls through to HTTP for non-graph inline node payloads', async () => {
    await worker.doWork({
      id: 'job-4',
      task_identifier: 'add',
      payload: { some: 'data' },
      database_id: 'db-123'
    });
    await flushMeter();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(graphCalls()).toHaveLength(0);
  });

  it('calls fail_node SQL when inline impl throws', async () => {
    const inlineNodes = require('../../job/worker/src/inline-nodes');
    const origSelect = inlineNodes.INLINE_NODES.select;
    inlineNodes.INLINE_NODES.select = () => { throw new Error('boom'); };

    try {
      await worker.doWork({
        id: 'job-5',
        task_identifier: 'select',
        payload: {
          execution_id: '00000000-0000-0000-0000-000000000005',
          node_name: 'sel_1',
          node_type: 'select',
          inputs: { obj: null },
          props: [{ name: 'path', value: 'x.y' }]
        },
        database_id: 'db-123'
      });
      await flushMeter();

      const gc = graphCalls();
      expect(gc).toHaveLength(1);
      const [sql, params] = gc[0];
      expect(sql).toContain('platform_fail_node');
      expect(params[0]).toBe('00000000-0000-0000-0000-000000000005');
      expect(params[1]).toBe('sel_1');
      expect(params[2]).toContain('boom');
    } finally {
      inlineNodes.INLINE_NODES.select = origSelect;
    }
  });

  it('handles async inline impls (graph nodes that return promises)', async () => {
    const origImpl = require('../../job/worker/src/inline-nodes').INLINE_NODES;
    origImpl['async-test'] = async (inputs: any) => ({
      value: (inputs.x ?? 0) * 2
    });

    try {
      await worker.doWork({
        id: 'job-6',
        task_identifier: 'async-test',
        payload: {
          execution_id: '00000000-0000-0000-0000-000000000006',
          node_name: 'async_1',
          node_type: 'async-test',
          inputs: { x: 5 }
        },
        database_id: 'db-123'
      });
      await flushMeter();

      expect(mockRequest).not.toHaveBeenCalled();
      const gc = graphCalls();
      expect(gc).toHaveLength(1);
      const [, params] = gc[0];
      expect(JSON.parse(params[2])).toEqual({ value: 10 });
    } finally {
      delete origImpl['async-test'];
    }
  });
});
