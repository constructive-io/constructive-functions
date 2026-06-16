/**
 * End-to-End Metering Integration Tests
 *
 * Three use cases covering the full metering pipeline:
 *
 *   1. Single job trigger (HTTP dispatch) — typical cloud function invocation
 *      Verifies: invocations INSERT via ModuleLoader resolution
 *
 *   2. FBP graph execution (inline dispatch) — flow triggers multiple nodes
 *      Verifies: each node metered with correct graph_execution_id,
 *      complete_node SQL called, multiple invocation rows
 *
 *   3. Inference metering via agentic server — LLM proxy with usage logging
 *      Verifies: compute_log INSERT with model, tokens, latency
 */

// ── Mocks (must be before imports) ────────────────────────────────────────────

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

import { createModuleMockQuery, MODULE_CONFIGS } from './helpers/module-mock';

const mockQuery = createModuleMockQuery();
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

// ── Imports ───────────────────────────────────────────────────────────────────

import express from 'express';
import http from 'http';

import { Worker } from '../../job/worker/src/index';
import { request as mockRequest } from '../../job/worker/src/req';
import { createAgenticServer } from '../../packages/agentic-server/src/server';

// ── Helpers ───────────────────────────────────────────────────────────────────

const flush = () => new Promise((r) => setTimeout(r, 30));

/** Filter query calls by SQL pattern */
const queriesMatching = (pattern: string) =>
  mockQuery.mock.calls.filter(([sql]: [string]) => sql.includes(pattern));

const invocationInserts = () =>
  mockQuery.mock.calls.filter(
    ([sql]: [string]) =>
      sql.includes('INSERT INTO') &&
      sql.includes(MODULE_CONFIGS.invocation.invocations_table_name)
  );
const inferenceInserts = () =>
  mockQuery.mock.calls.filter(
    ([sql]: [string]) =>
      sql.includes('INSERT INTO') &&
      sql.includes(MODULE_CONFIGS.computeLog.compute_log_table_name) &&
      sql.includes('model')
  );
const completeNodeCalls = () => queriesMatching(MODULE_CONFIGS.graph.complete_node_function);
const failNodeCalls = () => queriesMatching(MODULE_CONFIGS.graph.fail_node_function);
const metaschemaLookups = () =>
  mockQuery.mock.calls.filter(
    ([sql]: [string]) => sql.includes('_module')
  );

// ═══════════════════════════════════════════════════════════════════════════════
// USE CASE 1: Single Job Trigger (HTTP dispatch)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Use Case 1: Single job trigger (HTTP dispatch)', () => {
  let worker: InstanceType<typeof Worker>;

  beforeEach(() => {
    jest.clearAllMocks();
    worker = new Worker({
      tasks: ['send-email', 'send-verification-link'],
      pgPool: mockPool,
      workerId: 'test-worker-1'
    });
  });

  afterEach(async () => {
    await worker.stop();
  });

  it('dispatches job via HTTP and records invocation', async () => {
    await worker.doWork({
      id: 'job-http-1',
      task_identifier: 'send-email',
      payload: { to: 'user@example.com', subject: 'Welcome', html: '<p>Hello</p>' },
      database_id: 'db-tenant-001',
      actor_id: 'actor-admin-001',
      entity_id: 'entity-org-001'
    });
    await flush();

    // HTTP request was made to the function
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect((mockRequest as jest.Mock).mock.calls[0][0]).toBe('send-email');

    // MetaSchema resolution was attempted
    expect(metaschemaLookups().length).toBeGreaterThan(0);

    // Invocation INSERT fired
    const invocations = invocationInserts();
    expect(invocations).toHaveLength(1);
    const [invSql, invParams] = invocations[0];
    expect(invSql).toContain('INSERT INTO');
    expect(invParams[1]).toBe('db-tenant-001');    // database_id
    expect(invParams[2]).toBe('actor-admin-001');   // actor_id
    expect(invParams[3]).toBe('send-email');        // task_identifier
    expect(invParams[5]).toBeNull();               // graph_execution_id (no graph)
    expect(invParams[6]).toBe('ok');               // status
    expect(invParams[7]).toBeGreaterThanOrEqual(0); // duration_ms
  });

  it('records error status when HTTP dispatch fails', async () => {
    (mockRequest as jest.Mock).mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect(
      worker.doWork({
        id: 'job-http-2',
        task_identifier: 'send-email',
        payload: { to: 'fail@example.com' },
        database_id: 'db-tenant-002',
        actor_id: 'actor-002',
        entity_id: 'entity-002'
      })
    ).rejects.toThrow('ECONNREFUSED');
    await flush();

    // Error metering still fires
    const invocations = invocationInserts();
    expect(invocations).toHaveLength(1);
    const [, invParams] = invocations[0];
    expect(invParams[6]).toBe('error');                  // status
    expect(invParams[12]).toContain('ECONNREFUSED');     // error
  });

  it('includes payload and result in invocation record on success', async () => {
    await worker.doWork({
      id: 'job-http-3',
      task_identifier: 'send-verification-link',
      payload: { userId: 'u123', type: 'password-reset' },
      database_id: 'db-tenant-003'
    });
    await flush();

    const invocations = invocationInserts();
    expect(invocations).toHaveLength(1);
    const [, params] = invocations[0];
    const storedPayload = JSON.parse(params[10]);
    expect(storedPayload).toEqual({ userId: 'u123', type: 'password-reset' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// USE CASE 2: FBP Graph Execution (inline dispatch, multiple nodes)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Use Case 2: FBP graph execution (multiple inline nodes)', () => {
  let worker: InstanceType<typeof Worker>;
  const EXECUTION_ID = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    jest.clearAllMocks();
    worker = new Worker({
      tasks: ['number', 'add', 'multiply', 'template', 'send-email'],
      pgPool: mockPool,
      workerId: 'test-worker-2'
    });
  });

  afterEach(async () => {
    await worker.stop();
  });

  it('executes a multi-node graph: number → add → multiply, all metered', async () => {
    // Node 1: const/number produces { value: 5 }
    await worker.doWork({
      id: 'graph-job-1',
      task_identifier: 'number',
      payload: {
        execution_id: EXECUTION_ID,
        node_name: 'input_a',
        node_type: 'number',
        inputs: {},
        props: [{ name: 'value', value: 5 }]
      },
      database_id: 'db-graph-001',
      actor_id: 'actor-graph',
      entity_id: 'entity-graph'
    });
    await flush();

    // Node 2: const/number produces { value: 3 }
    await worker.doWork({
      id: 'graph-job-2',
      task_identifier: 'number',
      payload: {
        execution_id: EXECUTION_ID,
        node_name: 'input_b',
        node_type: 'number',
        inputs: {},
        props: [{ name: 'value', value: 3 }]
      },
      database_id: 'db-graph-001',
      actor_id: 'actor-graph',
      entity_id: 'entity-graph'
    });
    await flush();

    // Node 3: add receives { a: 5, b: 3 } → produces { sum: 8 }
    await worker.doWork({
      id: 'graph-job-3',
      task_identifier: 'add',
      payload: {
        execution_id: EXECUTION_ID,
        node_name: 'sum_node',
        node_type: 'add',
        inputs: { a: 5, b: 3 }
      },
      database_id: 'db-graph-001',
      actor_id: 'actor-graph',
      entity_id: 'entity-graph'
    });
    await flush();

    // Node 4: multiply receives { a: 8, b: 2 } → produces { product: 16 }
    await worker.doWork({
      id: 'graph-job-4',
      task_identifier: 'multiply',
      payload: {
        execution_id: EXECUTION_ID,
        node_name: 'multiply_node',
        node_type: 'multiply',
        inputs: { a: 8, b: 2 }
      },
      database_id: 'db-graph-001',
      actor_id: 'actor-graph',
      entity_id: 'entity-graph'
    });
    await flush();

    // ─── Verification ─────────────────────────────────────────────────

    // No HTTP requests — all inline
    expect(mockRequest).not.toHaveBeenCalled();

    // complete_node called for each inline node
    const completions = completeNodeCalls();
    expect(completions).toHaveLength(4);

    // Verify outputs are correct
    const outputs = completions.map(([, params]: [string, any[]]) => ({
      executionId: params[0],
      nodeName: params[1],
      output: JSON.parse(params[2])
    }));
    expect(outputs[0]).toEqual({ executionId: EXECUTION_ID, nodeName: 'input_a', output: { value: 5 } });
    expect(outputs[1]).toEqual({ executionId: EXECUTION_ID, nodeName: 'input_b', output: { value: 3 } });
    expect(outputs[2]).toEqual({ executionId: EXECUTION_ID, nodeName: 'sum_node', output: { sum: 8 } });
    expect(outputs[3]).toEqual({ executionId: EXECUTION_ID, nodeName: 'multiply_node', output: { product: 16 } });

    // Each node produced an invocation record
    const invocations = invocationInserts();
    expect(invocations).toHaveLength(4);

    // All share the same graph_execution_id
    for (const [, params] of invocations) {
      expect(params[5]).toBe(EXECUTION_ID); // graph_execution_id
      expect(params[1]).toBe('db-graph-001'); // database_id
      expect(params[6]).toBe('ok'); // status
    }

    // Verify task identifiers are correct
    const taskIds = invocations.map(([, params]: [string, any[]]) => params[3]);
    expect(taskIds).toEqual(['number', 'number', 'add', 'multiply']);
  });

  it('meters failed nodes with error status and calls fail_node', async () => {
    const inlineNodes = require('../../job/worker/src/inline-nodes');
    const origSelect = inlineNodes.INLINE_NODES.select;
    inlineNodes.INLINE_NODES.select = () => { throw new Error('null pointer: path missing'); };

    try {
      await worker.doWork({
        id: 'graph-job-fail',
        task_identifier: 'select',
        payload: {
          execution_id: EXECUTION_ID,
          node_name: 'broken_select',
          node_type: 'select',
          inputs: { obj: null },
          props: [{ name: 'path', value: 'x.y.z' }]
        },
        database_id: 'db-graph-001',
        actor_id: 'actor-graph',
        entity_id: 'entity-graph'
      });
      await flush();

      // fail_node SQL called (not complete_node)
      expect(failNodeCalls()).toHaveLength(1);
      const [, failParams] = failNodeCalls()[0];
      expect(failParams[0]).toBe(EXECUTION_ID);
      expect(failParams[1]).toBe('broken_select');
      expect(failParams[2]).toContain('null pointer');

      // Invocation still recorded with error status
      const invocations = invocationInserts();
      expect(invocations).toHaveLength(1);
      const [, params] = invocations[0];
      expect(params[5]).toBe(EXECUTION_ID);          // graph_execution_id
      expect(params[6]).toBe('error');               // status
      expect(params[12]).toContain('null pointer');   // error message
    } finally {
      inlineNodes.INLINE_NODES.select = origSelect;
    }
  });

  it('mixes inline and HTTP dispatch in the same graph', async () => {
    // Inline: number node
    await worker.doWork({
      id: 'graph-mixed-1',
      task_identifier: 'number',
      payload: {
        execution_id: EXECUTION_ID,
        node_name: 'const_1',
        node_type: 'number',
        inputs: {},
        props: [{ name: 'value', value: 42 }]
      },
      database_id: 'db-graph-001'
    });
    await flush();

    // HTTP: cloud function (send-email) in same graph
    await worker.doWork({
      id: 'graph-mixed-2',
      task_identifier: 'send-email',
      payload: {
        execution_id: EXECUTION_ID,
        node_name: 'email_node',
        node_type: 'send-email',
        inputs: { to: 'team@example.com', subject: 'Graph result: 42' }
      },
      database_id: 'db-graph-001'
    });
    await flush();

    // Inline node: complete_node called, no HTTP
    expect(completeNodeCalls()).toHaveLength(1);

    // HTTP node dispatched
    expect(mockRequest).toHaveBeenCalledTimes(1);

    // Both are metered as invocations
    const invocations = invocationInserts();
    expect(invocations.length).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// USE CASE 3: Inference Metering via Agentic Server
// ═══════════════════════════════════════════════════════════════════════════════

describe('Use Case 3: Inference metering via agentic server', () => {
  let mockProvider: { app: express.Express; calls: any[] };
  let providerServer: http.Server;
  let providerPort: number;

  beforeAll(async () => {
    // Create a mock LLM provider
    const app = express();
    app.use(express.json());
    const calls: any[] = [];

    app.post('/v1/chat/completions', (req: any, res: any) => {
      calls.push({ path: '/v1/chat/completions', body: req.body });
      res.json({
        id: 'chatcmpl-e2e-test',
        object: 'chat.completion',
        choices: [{ message: { role: 'assistant', content: 'Metering works!' }, finish_reason: 'stop', index: 0 }],
        usage: { prompt_tokens: 25, completion_tokens: 12, total_tokens: 37 }
      });
    });

    app.post('/v1/embeddings', (req: any, res: any) => {
      calls.push({ path: '/v1/embeddings', body: req.body });
      res.json({
        object: 'list',
        data: [{ object: 'embedding', embedding: [0.5, 0.6, 0.7], index: 0 }],
        usage: { prompt_tokens: 10, total_tokens: 10 }
      });
    });

    mockProvider = { app, calls };
    providerServer = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    providerPort = (providerServer.address() as { port: number }).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => providerServer.close(() => resolve()));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockProvider.calls.length = 0;
  });

  function createServer(overrides: Record<string, any> = {}) {
    return createAgenticServer({
      providerBaseUrl: `http://127.0.0.1:${providerPort}`,
      providerType: 'openai',
      pgPool: mockPool,
      ...overrides
    });
  }

  it('proxies chat completion and meters inference usage with correct tokens', async () => {
    const app = createServer();
    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    try {
      const port = (server.address() as { port: number }).port;
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-inference-001',
          'X-Entity-Id': 'entity-inference-001',
          'X-Actor-Id': 'actor-inference-001'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'What is metering?' }]
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.choices[0].message.content).toBe('Metering works!');

      await flush();

      // MetaSchema resolution was attempted
      expect(metaschemaLookups().length).toBeGreaterThan(0);

      // Inference usage INSERT fired
      const inferences = inferenceInserts();
      expect(inferences).toHaveLength(1);
      const [sql, params] = inferences[0];
      expect(sql).toContain('INSERT INTO');

      // Verify columns
      expect(params[0]).toBe('db-inference-001');     // database_id
      expect(params[1]).toBe('entity-inference-001'); // entity_id
      expect(params[2]).toBe('actor-inference-001');  // actor_id
      expect(params[4]).toBe('gpt-4o');              // model
      expect(params[5]).toBe('openai');              // provider
      expect(params[6]).toBe('chat');                // service
      expect(params[7]).toBe('chat/completions');     // operation
      expect(params[8]).toBe(25);                    // input_tokens
      expect(params[9]).toBe(12);                    // output_tokens
      expect(params[10]).toBe(37);                   // total_tokens
      expect(params[11]).toBeGreaterThan(0);          // latency_ms
      expect(params[12]).toBe('ok');                 // status
      expect(params[13]).toBeNull();                 // error_type
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('proxies embedding request and meters with correct service type', async () => {
    const app = createServer();
    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    try {
      const port = (server.address() as { port: number }).port;
      const res = await fetch(`http://127.0.0.1:${port}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-embed-001'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: 'vector search test'
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data[0].embedding).toEqual([0.5, 0.6, 0.7]);

      await flush();

      const inferences = inferenceInserts();
      expect(inferences).toHaveLength(1);
      const [, params] = inferences[0];
      expect(params[4]).toBe('text-embedding-3-small'); // model
      expect(params[6]).toBe('embed');                   // service
      expect(params[7]).toBe('embeddings');               // operation
      expect(params[8]).toBe(10);                        // input_tokens
      expect(params[9]).toBe(0);                         // output_tokens
      expect(params[10]).toBe(10);                       // total_tokens
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('meters error status when provider returns failure', async () => {
    // Create a provider that returns 500
    const errorApp = express();
    errorApp.use(express.json());
    errorApp.post('/v1/chat/completions', (_req: any, res: any) => {
      res.status(500).json({ error: { message: 'Internal server error' } });
    });
    const errorServer = await new Promise<http.Server>((resolve) => {
      const s = errorApp.listen(0, () => resolve(s));
    });
    const errorPort = (errorServer.address() as { port: number }).port;

    const app = createAgenticServer({
      providerBaseUrl: `http://127.0.0.1:${errorPort}`,
      providerType: 'openai',
      pgPool: mockPool
    });
    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    try {
      const port = (server.address() as { port: number }).port;
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-error-001'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'This will fail' }]
        })
      });

      // Server returns error upstream
      expect(res.status).toBeGreaterThanOrEqual(400);
      await flush();

      // Metering still fires with error status
      const inferences = inferenceInserts();
      expect(inferences).toHaveLength(1);
      const [, params] = inferences[0];
      expect(params[12]).toBe('error');  // status
      expect(params[13]).toBeDefined();  // error_type
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await new Promise<void>((resolve) => errorServer.close(() => resolve()));
    }
  });

  it('never blocks the response — metering is fire-and-forget', async () => {
    // Override mock to make INSERT slow (100ms delay) but keep metaschema fast
    const originalImpl = mockQuery.getMockImplementation();
    mockQuery.mockImplementation((sql: string, ...args: any[]) => {
      if (typeof sql === 'string' && sql.includes('INSERT INTO')) {
        return new Promise((resolve) => setTimeout(() => resolve({ rows: [] }), 100));
      }
      return originalImpl!(sql, ...args);
    });

    const app = createServer();
    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });

    try {
      const port = (server.address() as { port: number }).port;
      const start = Date.now();
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-perf-001'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Speed test' }]
        })
      });
      const elapsed = Date.now() - start;

      expect(res.status).toBe(200);
      // Response returned before metering INSERT completes
      // (metering has 100ms delay; response should come back faster)
      expect(elapsed).toBeLessThan(100);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
