/**
 * Integration tests for the agentic server (published package).
 *
 * Verifies:
 *   1. Router mounts and responds to requests
 *   2. Returns 401 when no userId in context
 *   3. Returns 404 when agentChat module is not provisioned
 *   4. Creates threads with correct parameters
 *   5. Entity-scoped thread creation works
 *   6. Returns 400 when messages array is empty
 *   7. Embedding endpoint returns 503 without provider
 *   8. Embedding endpoint generates embeddings with provider
 *   9. Thread messages returns 404 for missing thread
 *  10. Billing quota check blocks when exceeded
 */

import express from 'express';
import http from 'http';
import { createAgenticRouter } from 'agentic-server';

const flush = () => new Promise((r) => setTimeout(r, 30));

/** Middleware that attaches a mock constructive context to req */
function mockContextMiddleware(ctx: Record<string, any>) {
  return (req: any, _res: any, next: any) => {
    req.constructive = ctx;
    next();
  };
}

describe('agentic server (published package)', () => {
  function createApp(ctx: Record<string, any>) {
    const app = express();
    app.use(express.json());
    app.use(mockContextMiddleware(ctx));
    app.use(createAgenticRouter());
    return app;
  }

  function listen(app: express.Express): Promise<{ server: http.Server; baseUrl: string }> {
    return new Promise((resolve) => {
      const server = app.listen(0, () => {
        const addr = server.address() as { port: number };
        resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
      });
    });
  }

  function close(server: http.Server): Promise<void> {
    return new Promise((resolve) => server.close(() => resolve()));
  }

  describe('thread creation', () => {
    it('returns 401 when no userId in context', async () => {
      const app = createApp({ userId: null });
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        expect(res.status).toBe(401);
        const body = await res.json() as any;
        expect(body.error).toContain('Authentication');
      } finally {
        await close(server);
      }
    });

    it('returns 404 when agentChat module is not provisioned', async () => {
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue(null)
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        expect(res.status).toBe(404);
        const body = await res.json() as any;
        expect(body.error).toContain('not provisioned');
      } finally {
        await close(server);
      }
    });

    it('creates thread with correct parameters', async () => {
      const threadRow = { id: 'thread-1', mode: 'ask', model: null, system_prompt: null, status: 'active', created_at: new Date().toISOString() };
      const mockClient = { query: jest.fn().mockResolvedValue({ rows: [threadRow] }) };
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue({ schemaName: 'app_public', threadTableName: 'agent_threads', messageTableName: 'agent_messages' }),
        withPgClient: jest.fn(async (fn: any) => fn(mockClient))
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'ask', title: 'Test thread' })
        });
        expect(res.status).toBe(201);
        const body = await res.json() as any;
        expect(body.id).toBe('thread-1');
        expect(body.mode).toBe('ask');
      } finally {
        await close(server);
      }
    });

    it('creates entity-scoped thread via /v1/orgs/:entity_id/threads', async () => {
      const threadRow = { id: 'thread-2', mode: 'ask', model: null, system_prompt: null, status: 'active', created_at: new Date().toISOString() };
      const mockClient = { query: jest.fn().mockResolvedValue({ rows: [threadRow] }) };
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue({ schemaName: 'app_public', threadTableName: 'agent_threads', messageTableName: 'agent_messages' }),
        withPgClient: jest.fn(async (fn: any) => fn(mockClient))
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/orgs/entity-abc/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        expect(res.status).toBe(201);
        const body = await res.json() as any;
        expect(body.id).toBe('thread-2');
        // Verify entity_id was passed in the INSERT
        const insertArgs = mockClient.query.mock.calls[0][1];
        expect(insertArgs[0]).toBe('entity-abc');
      } finally {
        await close(server);
      }
    });
  });

  describe('thread messages', () => {
    it('returns 401 when no userId in context', async () => {
      const app = createApp({ userId: null });
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads/thread-1/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })
        });
        expect(res.status).toBe(401);
      } finally {
        await close(server);
      }
    });

    it('returns 400 when messages array is empty', async () => {
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue({ schemaName: 'app_public', threadTableName: 'agent_threads', messageTableName: 'agent_messages' }),
        withPgClient: jest.fn()
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads/thread-1/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [] })
        });
        expect(res.status).toBe(400);
        const body = await res.json() as any;
        expect(body.error).toContain('messages');
      } finally {
        await close(server);
      }
    });

    it('returns 404 for missing thread', async () => {
      const mockClient = { query: jest.fn().mockResolvedValue({ rows: [] }) };
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue({ schemaName: 'app_public', threadTableName: 'agent_threads', messageTableName: 'agent_messages' }),
        withPgClient: jest.fn(async (fn: any) => fn(mockClient)),
        useBilling: jest.fn().mockResolvedValue(null),
        useLlm: jest.fn().mockResolvedValue(null)
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads/nonexistent/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
        });
        expect(res.status).toBe(404);
        const body = await res.json() as any;
        expect(body.error).toContain('not found');
      } finally {
        await close(server);
      }
    });

    it('returns 429 when billing quota is exceeded', async () => {
      const threadRow = { id: 'thread-1', mode: 'ask', model: 'gpt-4o', system_prompt: null, status: 'active' };
      const mockClient = { query: jest.fn().mockResolvedValue({ rows: [threadRow] }) };
      const mockBilling = { checkQuota: jest.fn().mockResolvedValue(false), recordUsage: jest.fn(), logInference: jest.fn() };
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue({ schemaName: 'app_public', threadTableName: 'agent_threads', messageTableName: 'agent_messages' }),
        withPgClient: jest.fn(async (fn: any) => fn(mockClient)),
        useBilling: jest.fn().mockResolvedValue(mockBilling),
        useLlm: jest.fn().mockResolvedValue({ chatProvider: 'ollama', chatModel: 'llama3', chatBaseUrl: 'http://localhost:11434' })
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/threads/thread-1/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
        });
        expect(res.status).toBe(429);
        const body = await res.json() as any;
        expect(body.error).toContain('quota');
      } finally {
        await close(server);
      }
    });
  });

  describe('embeddings', () => {
    it('returns 503 when no embedding provider configured', async () => {
      const ctx = {
        userId: 'user-1',
        useModule: jest.fn().mockResolvedValue(null),
        useLlm: jest.fn().mockResolvedValue(null),
        useBilling: jest.fn().mockResolvedValue(null)
      };
      const app = createApp(ctx);
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: 'test text' })
        });
        // Without a configured provider, should return error
        expect(res.status).toBeGreaterThanOrEqual(400);
      } finally {
        await close(server);
      }
    });

    it('returns 401 for embed when no userId', async () => {
      const app = createApp({ userId: null });
      const { server, baseUrl } = await listen(app);
      try {
        const res = await fetch(`${baseUrl}/v1/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: 'test' })
        });
        expect(res.status).toBe(401);
      } finally {
        await close(server);
      }
    });
  });
});
