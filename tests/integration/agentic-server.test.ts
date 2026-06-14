/**
 * Integration tests for the agentic server as a first-class service.
 *
 * Verifies:
 *   1. Health check endpoint returns provider config
 *   2. Chat completions proxy with inference metering
 *   3. Embeddings proxy with inference metering
 *   4. Error handling when provider is unreachable
 *   5. Identity header stripping for external requests
 *   6. Metering fires for both success and error paths
 *   7. Metering never blocks the response
 */

import express from 'express';
import http from 'http';
import { createAgenticServer } from '../../packages/agentic-server/src/server';

const flush = () => new Promise((r) => setTimeout(r, 30));

/** Create a mock LLM provider that returns predictable responses */
function createMockProvider() {
  const app = express();
  app.use(express.json());

  const calls: { path: string; body: any; headers: Record<string, string | undefined> }[] = [];

  app.post('/v1/chat/completions', (req: any, res: any) => {
    calls.push({ path: '/v1/chat/completions', body: req.body, headers: req.headers });
    res.json({
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      choices: [{ message: { role: 'assistant', content: 'Hello from mock!' }, finish_reason: 'stop', index: 0 }],
      usage: { prompt_tokens: 15, completion_tokens: 8, total_tokens: 23 }
    });
  });

  app.post('/v1/embeddings', (req: any, res: any) => {
    calls.push({ path: '/v1/embeddings', body: req.body, headers: req.headers });
    res.json({
      object: 'list',
      data: [{ object: 'embedding', embedding: [0.1, 0.2, 0.3], index: 0 }],
      usage: { prompt_tokens: 5, total_tokens: 5 }
    });
  });

  return { app, calls };
}

describe('agentic server (first-class service)', () => {
  let mockProvider: ReturnType<typeof createMockProvider>;
  let providerServer: http.Server;
  let providerPort: number;
  let mockQuery: jest.Mock;
  let mockPool: any;

  beforeAll(async () => {
    mockProvider = createMockProvider();
    providerServer = await new Promise<http.Server>((resolve) => {
      const s = mockProvider.app.listen(0, () => resolve(s));
    });
    const addr = providerServer.address() as { port: number };
    providerPort = addr.port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => providerServer.close(() => resolve()));
  });

  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue({ rows: [] });
    mockPool = { query: mockQuery } as any;
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

  describe('healthz', () => {
    it('returns provider config', async () => {
      const app = createServer();
      const server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      try {
        const addr = server.address() as { port: number };
        const res = await fetch(`http://127.0.0.1:${addr.port}/healthz`);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toMatchObject({ status: 'ok', provider: 'openai' });
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });

  describe('chat/completions with metering', () => {
    let server: http.Server;
    let baseUrl: string;

    beforeEach(async () => {
      const app = createServer();
      server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    });

    afterEach(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('proxies to upstream and returns response', async () => {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-test',
          'X-Entity-Id': 'entity-test'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.choices[0].message.content).toBe('Hello from mock!');
      expect(body.usage.total_tokens).toBe(23);
    });

    it('fires inference metering INSERT after chat completion', async () => {
      await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-meter',
          'X-Entity-Id': 'entity-meter',
          'X-Actor-Id': 'actor-meter'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
      await flush();

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('platform_usage_log_inferences');
      expect(params[1]).toBe('db-meter');       // database_id
      expect(params[2]).toBe('entity-meter');   // entity_id
      expect(params[3]).toBe('actor-meter');     // actor_id
      expect(params[5]).toBe('gpt-4o');          // model
      expect(params[6]).toBe('openai');          // provider
      expect(params[7]).toBe('chat');            // service
      expect(params[9]).toBe(15);                // input_tokens
      expect(params[10]).toBe(8);                // output_tokens
      expect(params[11]).toBe(23);               // total_tokens
      expect(params[13]).toBe('ok');             // status
    });

    it('meters latency_ms as positive integer', async () => {
      await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
      await flush();

      const [, params] = mockQuery.mock.calls[0];
      const latencyMs = params[12];
      expect(typeof latencyMs).toBe('number');
      expect(latencyMs).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(latencyMs)).toBe(true);
    });

    it('metering never blocks the response', async () => {
      // Make metering slow — response should still be fast
      mockQuery.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ rows: [] }), 500)));

      const start = Date.now();
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
      const elapsed = Date.now() - start;

      expect(res.status).toBe(200);
      // Response should arrive well before the 500ms metering delay
      expect(elapsed).toBeLessThan(400);
    });
  });

  describe('embeddings with metering', () => {
    let server: http.Server;
    let baseUrl: string;

    beforeEach(async () => {
      const app = createServer();
      server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      baseUrl = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    });

    afterEach(async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('proxies embed request and meters usage', async () => {
      const res = await fetch(`${baseUrl}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Service': 'fn-runtime',
          'X-Database-Id': 'db-embed'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: 'Hello world'
        })
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data[0].embedding).toEqual([0.1, 0.2, 0.3]);

      await flush();
      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('platform_usage_log_inferences');
      expect(params[7]).toBe('embed');            // service
      expect(params[8]).toBe('embeddings');        // operation
    });
  });

  describe('error handling', () => {
    it('returns 502 when provider is unreachable', async () => {
      const app = createServer({ providerBaseUrl: 'http://127.0.0.1:1' });
      const server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      try {
        const addr = server.address() as { port: number };
        const res = await fetch(`http://127.0.0.1:${addr.port}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] })
        });
        expect(res.status).toBe(502);
        const body = await res.json() as any;
        expect(body.error.message).toContain('Failed to reach LLM provider');

        await flush();
        // Error path also fires metering
        expect(mockQuery).toHaveBeenCalledTimes(1);
        const [, params] = mockQuery.mock.calls[0];
        expect(params[13]).toBe('error');  // status
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it('metering error does not crash the server', async () => {
      mockQuery.mockRejectedValue(new Error('DB is down'));

      const app = createServer();
      const server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      try {
        const addr = server.address() as { port: number };
        const res = await fetch(`http://127.0.0.1:${addr.port}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });
        expect(res.status).toBe(200);
        const body = await res.json() as any;
        expect(body.choices[0].message.content).toBe('Hello from mock!');
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });

  describe('identity headers', () => {
    it('strips identity headers from external requests', async () => {
      const app = createServer();
      const server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      try {
        const addr = server.address() as { port: number };
        // No X-Internal-Service header = external request
        await fetch(`http://127.0.0.1:${addr.port}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Database-Id': 'forged-db',
            'X-Entity-Id': 'forged-entity'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });
        await flush();

        // Metering should have null database_id (stripped → undefined → null via ?? null)
        const [, params] = mockQuery.mock.calls[0];
        expect(params[1]).toBeNull();  // database_id stripped
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });

  describe('without pgPool (metering disabled)', () => {
    it('works normally without metering', async () => {
      const app = createServer({ pgPool: undefined });
      const server = await new Promise<http.Server>((resolve) => {
        const s = app.listen(0, () => resolve(s));
      });
      try {
        const addr = server.address() as { port: number };
        const res = await fetch(`http://127.0.0.1:${addr.port}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });
        expect(res.status).toBe(200);
        await flush();
        expect(mockQuery).not.toHaveBeenCalled();
      } finally {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});
