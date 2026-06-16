/**
 * Integration tests for multi-provider routing and /v1/usage endpoint.
 *
 * Verifies:
 *   1. Multi-provider routing by model name prefix
 *   2. Multi-provider routing by X-Provider header
 *   3. Model-based auto-routing (claude-* → anthropic, gpt-* → openai)
 *   4. /v1/usage endpoint accepts external usage reports
 *   5. /v1/providers lists configured providers
 *   6. Anthropic response transformation to OpenAI format
 */

import express from 'express';
import http from 'http';

import { createAgenticServer } from '../../packages/agentic-server/src/server';
import { createModuleMockQuery, MODULE_CONFIGS } from './helpers/module-mock';

const flush = () => new Promise((r) => setTimeout(r, 30));

// ── Mock Providers ────────────────────────────────────────────────────────────

function createMockOpenAI() {
  const app = express();
  app.use(express.json());
  const calls: any[] = [];

  app.post('/v1/chat/completions', (req: any, res: any) => {
    calls.push({ provider: 'openai', body: req.body });
    res.json({
      id: 'chatcmpl-openai',
      object: 'chat.completion',
      choices: [{ message: { role: 'assistant', content: 'Hello from OpenAI!' }, finish_reason: 'stop', index: 0 }],
      usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 }
    });
  });

  app.post('/v1/embeddings', (req: any, res: any) => {
    calls.push({ provider: 'openai', path: '/v1/embeddings', body: req.body });
    res.json({
      object: 'list',
      data: [{ object: 'embedding', embedding: [0.1, 0.2, 0.3], index: 0 }],
      usage: { prompt_tokens: 5, total_tokens: 5 }
    });
  });

  return { app, calls };
}

function createMockAnthropic() {
  const app = express();
  app.use(express.json());
  const calls: any[] = [];

  app.post('/v1/messages', (req: any, res: any) => {
    calls.push({ provider: 'anthropic', body: req.body, headers: req.headers });
    res.json({
      id: 'msg_anthropic',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'Hello from Anthropic!' }],
      usage: { input_tokens: 15, output_tokens: 8 }
    });
  });

  return { app, calls };
}

function createMockOllama() {
  const app = express();
  app.use(express.json());
  const calls: any[] = [];

  app.post('/api/chat', (req: any, res: any) => {
    calls.push({ provider: 'ollama', body: req.body });
    res.json({
      message: { role: 'assistant', content: 'Hello from Ollama!' },
      done: true,
      prompt_eval_count: 12,
      eval_count: 6
    });
  });

  app.post('/api/embed', (req: any, res: any) => {
    calls.push({ provider: 'ollama', path: '/api/embed', body: req.body });
    res.json({
      model: req.body.model,
      embeddings: [[0.4, 0.5, 0.6]]
    });
  });

  return { app, calls };
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('Multi-provider routing', () => {
  let openai: ReturnType<typeof createMockOpenAI>;
  let anthropic: ReturnType<typeof createMockAnthropic>;
  let ollama: ReturnType<typeof createMockOllama>;
  let openaiServer: http.Server;
  let anthropicServer: http.Server;
  let ollamaServer: http.Server;
  let openaiPort: number;
  let anthropicPort: number;
  let ollamaPort: number;
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeAll(async () => {
    openai = createMockOpenAI();
    anthropic = createMockAnthropic();
    ollama = createMockOllama();

    [openaiServer, anthropicServer, ollamaServer] = await Promise.all([
      new Promise<http.Server>((resolve) => { const s = openai.app.listen(0, () => resolve(s)); }),
      new Promise<http.Server>((resolve) => { const s = anthropic.app.listen(0, () => resolve(s)); }),
      new Promise<http.Server>((resolve) => { const s = ollama.app.listen(0, () => resolve(s)); })
    ]);

    openaiPort = (openaiServer.address() as { port: number }).port;
    anthropicPort = (anthropicServer.address() as { port: number }).port;
    ollamaPort = (ollamaServer.address() as { port: number }).port;
  });

  afterAll(async () => {
    await Promise.all([
      new Promise<void>((r) => openaiServer.close(() => r())),
      new Promise<void>((r) => anthropicServer.close(() => r())),
      new Promise<void>((r) => ollamaServer.close(() => r()))
    ]);
  });

  beforeEach(() => {
    mockQuery = createModuleMockQuery();
    mockPool = { query: mockQuery } as any;
    openai.calls.length = 0;
    anthropic.calls.length = 0;
    ollama.calls.length = 0;
  });

  function createMultiServer() {
    return createAgenticServer({
      providers: [
        { type: 'openai', baseUrl: `http://127.0.0.1:${openaiPort}`, apiKey: 'sk-test-openai', defaultModel: 'gpt-4o' },
        { type: 'anthropic', baseUrl: `http://127.0.0.1:${anthropicPort}`, apiKey: 'sk-ant-test', defaultModel: 'claude-sonnet-4-20250514' },
        { type: 'ollama', baseUrl: `http://127.0.0.1:${ollamaPort}`, defaultModel: 'llama3' }
      ],
      pgPool: mockPool
    });
  }

  async function withServer(app: any, fn: (port: number) => Promise<void>) {
    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    try {
      await fn((server.address() as { port: number }).port);
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  }

  // ─── Routing Tests ──────────────────────────────────────────────────────

  it('routes gpt-* models to OpenAI provider', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.choices[0].message.content).toBe('Hello from OpenAI!');
      expect(openai.calls).toHaveLength(1);
      expect(anthropic.calls).toHaveLength(0);
      expect(ollama.calls).toHaveLength(0);
    });
  });

  it('routes claude-* models to Anthropic provider', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', messages: [{ role: 'user', content: 'Hi' }] })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.choices[0].message.content).toBe('Hello from Anthropic!');
      expect(anthropic.calls).toHaveLength(1);
      expect(openai.calls).toHaveLength(0);
    });
  });

  it('routes llama-* models to Ollama provider', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'llama3', messages: [{ role: 'user', content: 'Hi' }] })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.choices[0].message.content).toBe('Hello from Ollama!');
      expect(ollama.calls).toHaveLength(1);
      expect(openai.calls).toHaveLength(0);
    });
  });

  it('routes by X-Provider header (overrides model name)', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'test',
          'X-Provider': 'ollama'
        },
        body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] })
      });
      expect(res.status).toBe(200);
      // Even though model is gpt-4o, X-Provider forces ollama
      expect(ollama.calls).toHaveLength(1);
      expect(openai.calls).toHaveLength(0);
    });
  });

  it('routes by model prefix notation: "anthropic/claude-3.5-sonnet"', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'anthropic/claude-3.5-sonnet', messages: [{ role: 'user', content: 'Hi' }] })
      });
      expect(res.status).toBe(200);
      expect(anthropic.calls).toHaveLength(1);
      // Model sent to Anthropic should strip the prefix
      expect(anthropic.calls[0].body.model).toBe('claude-3.5-sonnet');
    });
  });

  // ─── Anthropic Transform Tests ──────────────────────────────────────────

  it('transforms Anthropic response to OpenAI-compatible format', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', messages: [{ role: 'user', content: 'Hello' }] })
      });
      const body = await res.json() as any;
      // Should be in OpenAI format
      expect(body.object).toBe('chat.completion');
      expect(body.choices[0].message.role).toBe('assistant');
      expect(body.choices[0].message.content).toBe('Hello from Anthropic!');
      expect(body.usage.prompt_tokens).toBe(15);
      expect(body.usage.completion_tokens).toBe(8);
      expect(body.usage.total_tokens).toBe(23);
    });
  });

  it('sends x-api-key header for Anthropic (not Authorization Bearer)', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', messages: [{ role: 'user', content: 'Hi' }] })
      });
      const headers = anthropic.calls[0].headers;
      expect(headers['x-api-key']).toBe('sk-ant-test');
      expect(headers['anthropic-version']).toBe('2023-06-01');
      expect(headers['authorization']).toBeUndefined();
    });
  });

  it('extracts system message for Anthropic', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          messages: [
            { role: 'system', content: 'You are helpful.' },
            { role: 'user', content: 'Hi' }
          ]
        })
      });
      const body = anthropic.calls[0].body;
      expect(body.system).toBe('You are helpful.');
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
    });
  });

  // ─── Metering Tests ─────────────────────────────────────────────────────

  it('meters inference with correct provider name', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'test',
          'X-Database-Id': 'db-multi-001'
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', messages: [{ role: 'user', content: 'Hi' }] })
      });
      await flush();

      const insertCalls = mockQuery.mock.calls.filter(
        ([sql]: [string]) => sql.includes('INSERT INTO') && sql.includes(MODULE_CONFIGS.computeLog.compute_log_table_name)
      );
      expect(insertCalls).toHaveLength(1);
      const [, params] = insertCalls[0];
      expect(params[5]).toBe('anthropic'); // provider
      expect(params[8]).toBe(15);          // input_tokens
      expect(params[9]).toBe(8);           // output_tokens
      expect(params[10]).toBe(23);         // total_tokens
    });
  });

  // ─── Embeddings ─────────────────────────────────────────────────────────

  it('routes embedding requests to correct provider', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Internal-Service': 'test' },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: 'hello' })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data[0].embedding).toEqual([0.1, 0.2, 0.3]);
      // gpt/text-embedding → openai
      expect(openai.calls).toHaveLength(1);
    });
  });

  it('routes ollama embeddings via X-Provider', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'test',
          'X-Provider': 'ollama'
        },
        body: JSON.stringify({ model: 'nomic-embed-text', input: 'hello' })
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data[0].embedding).toEqual([0.4, 0.5, 0.6]);
      expect(ollama.calls).toHaveLength(1);
    });
  });

  // ─── /v1/providers Endpoint ─────────────────────────────────────────────

  it('lists configured providers', async () => {
    const app = createMultiServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/providers`);
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.providers).toHaveLength(3);
      expect(body.providers.map((p: any) => p.type)).toEqual(['openai', 'anthropic', 'ollama']);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /v1/usage — External Usage Reporting
// ═══════════════════════════════════════════════════════════════════════════════

describe('/v1/usage endpoint', () => {
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeEach(() => {
    mockQuery = createModuleMockQuery();
    mockPool = { query: mockQuery } as any;
  });

  function createServer() {
    return createAgenticServer({
      providerBaseUrl: 'http://localhost:11434',
      providerType: 'openai',
      pgPool: mockPool
    });
  }

  async function withServer(app: any, fn: (port: number) => Promise<void>) {
    const server = await new Promise<http.Server>((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    try {
      await fn((server.address() as { port: number }).port);
    } finally {
      await new Promise<void>((r) => server.close(() => r()));
    }
  }

  it('accepts external usage report and returns 202', async () => {
    const app = createServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-python-001',
          'X-Entity-Id': 'entity-py',
          'X-Actor-Id': 'actor-py'
        },
        body: JSON.stringify({
          model: 'llama3-8b',
          provider: 'llamaparse',
          service: 'chat',
          operation: 'local-inference',
          input_tokens: 500,
          output_tokens: 200,
          total_tokens: 700,
          latency_ms: 1200,
          status: 'ok'
        })
      });
      expect(res.status).toBe(202);
      const body = await res.json() as any;
      expect(body.accepted).toBe(true);
    });
  });

  it('fires inference metering INSERT with reported values', async () => {
    const app = createServer();
    await withServer(app, async (port) => {
      await fetch(`http://127.0.0.1:${port}/v1/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-python-002',
          'X-Entity-Id': 'entity-usage',
          'X-Actor-Id': 'actor-usage'
        },
        body: JSON.stringify({
          model: 'huggingface/meta-llama/Llama-3-8B',
          provider: 'huggingface',
          service: 'chat',
          operation: 'text-generation',
          input_tokens: 1000,
          output_tokens: 500,
          total_tokens: 1500,
          latency_ms: 3500,
          status: 'ok',
          raw_usage: { custom_field: 'metadata' }
        })
      });
      await flush();

      const insertCalls = mockQuery.mock.calls.filter(
        ([sql]: [string]) => sql.includes('INSERT INTO') && sql.includes(MODULE_CONFIGS.computeLog.compute_log_table_name)
      );
      expect(insertCalls).toHaveLength(1);
      const [, params] = insertCalls[0];
      // params: [database_id, entity_id, actor_id, request_id, model, provider, service, operation, ...]
      expect(params[0]).toBe('db-python-002');    // database_id
      expect(params[1]).toBe('entity-usage');     // entity_id
      expect(params[2]).toBe('actor-usage');      // actor_id
      expect(params[4]).toBe('huggingface/meta-llama/Llama-3-8B'); // model
      expect(params[5]).toBe('huggingface');       // provider
      expect(params[6]).toBe('chat');             // service
      expect(params[7]).toBe('text-generation');   // operation
      expect(params[8]).toBe(1000);              // input_tokens
      expect(params[9]).toBe(500);               // output_tokens
      expect(params[10]).toBe(1500);             // total_tokens
      expect(params[11]).toBe(3500);             // latency_ms
      expect(params[12]).toBe('ok');             // status
    });
  });

  it('returns 400 when model is missing', async () => {
    const app = createServer();
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'local', input_tokens: 100 })
      });
      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.error.message).toContain('model is required');
    });
  });

  it('handles error status reports', async () => {
    const app = createServer();
    await withServer(app, async (port) => {
      await fetch(`http://127.0.0.1:${port}/v1/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-err'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          provider: 'openai',
          status: 'error',
          error_type: 'rate_limited',
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
          latency_ms: 50
        })
      });
      await flush();

      const insertCalls = mockQuery.mock.calls.filter(
        ([sql]: [string]) => sql.includes('INSERT INTO') && sql.includes(MODULE_CONFIGS.computeLog.compute_log_table_name)
      );
      expect(insertCalls).toHaveLength(1);
      const [, params] = insertCalls[0];
      expect(params[12]).toBe('error');          // status
      expect(params[13]).toBe('rate_limited');   // error_type
    });
  });

  it('works without pgPool configured (graceful no-op)', async () => {
    const app = createAgenticServer({
      providerBaseUrl: 'http://localhost:11434',
      providerType: 'openai'
      // no pgPool
    });
    await withServer(app, async (port) => {
      const res = await fetch(`http://127.0.0.1:${port}/v1/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'local-model', input_tokens: 10 })
      });
      expect(res.status).toBe(202);
    });
  });
});
