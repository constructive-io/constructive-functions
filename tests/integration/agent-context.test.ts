import { buildContext } from '../../packages/fn-runtime/src/context';
import express from 'express';
import type { Server } from 'http';

/**
 * Integration test for context.agent — the AgentContext injected into
 * cloud function handlers for typed, metered LLM inference.
 *
 * Uses a mock agentic server to verify:
 *   - context.agent is present when AGENTIC_SERVER_URL is set
 *   - context.agent.inference() calls the agentic server with correct headers
 *   - context.agent.embed() calls the embedding endpoint
 *   - X-Database-Id and X-Entity-Id are forwarded from job context
 *   - context.agent is a stub that throws when AGENTIC_SERVER_URL is not set
 */

let mockServer: Server;
let mockPort: number;
let receivedRequests: Array<{
  path: string;
  method: string;
  headers: Record<string, string | undefined>;
  body: any;
}>;

beforeAll(async () => {
  // Start a mock agentic server that records requests
  const app = express();
  app.use(express.json());

  const handler = (req: any, res: any) => {
    receivedRequests.push({
      path: req.path,
      method: req.method,
      headers: {
        'x-database-id': req.get('X-Database-Id'),
        'x-entity-id': req.get('X-Entity-Id'),
        'x-actor-id': req.get('X-Actor-Id'),
        'x-internal-service': req.get('X-Internal-Service')
      },
      body: req.body
    });

    // Mock responses based on endpoint
    if (req.path === '/v1/chat/completions') {
      res.json({
        id: 'chatcmpl-mock',
        choices: [
          {
            message: { role: 'assistant', content: 'Hello from mock LLM' },
            finish_reason: 'stop',
            index: 0
          }
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
      });
    } else if (req.path === '/v1/embeddings') {
      res.json({
        data: [{ embedding: [0.1, 0.2, 0.3], index: 0 }],
        usage: { prompt_tokens: 3, total_tokens: 3 }
      });
    } else if (req.path === '/healthz') {
      res.json({ status: 'ok' });
    } else {
      res.status(404).json({ error: 'not found' });
    }
  };

  app.post('/v1/chat/completions', handler);
  app.post('/v1/embeddings', handler);
  app.get('/healthz', handler);

  await new Promise<void>((resolve) => {
    mockServer = app.listen(0, () => {
      const addr = mockServer.address();
      mockPort = typeof addr === 'object' && addr ? addr.port : 0;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    mockServer.close((err) => (err ? reject(err) : resolve()));
  });
});

beforeEach(() => {
  receivedRequests = [];
});

describe('AgentContext', () => {
  describe('when AGENTIC_SERVER_URL is set', () => {
    it('injects context.agent with inference and embed methods', () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      process.env.AGENTIC_SERVER_URL = `http://localhost:${mockPort}`;

      try {
        const context = buildContext({
          databaseId: 'db-test-123',
          entityId: 'entity-456',
          actorId: 'actor-789'
        });

        expect(context.agent).toBeDefined();
        expect(typeof context.agent.inference).toBe('function');
        expect(typeof context.agent.embed).toBe('function');
        expect(context.agent.databaseId).toBe('db-test-123');
        expect(context.agent.entityId).toBe('entity-456');
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });

    it('inference() sends a request to /v1/chat/completions with correct headers', async () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      process.env.AGENTIC_SERVER_URL = `http://localhost:${mockPort}`;

      try {
        const context = buildContext({
          databaseId: 'db-test-123',
          entityId: 'entity-456',
          actorId: 'actor-789'
        });

        const result = await context.agent.inference({
          messages: [{ role: 'user', content: 'Hello' }],
          model: 'gpt-4o'
        });

        // Verify the mock server received the request
        expect(receivedRequests).toHaveLength(1);
        const req = receivedRequests[0];
        expect(req.path).toBe('/v1/chat/completions');
        expect(req.method).toBe('POST');

        // Verify identity headers were forwarded
        expect(req.headers['x-database-id']).toBe('db-test-123');
        expect(req.headers['x-entity-id']).toBe('entity-456');
        expect(req.headers['x-actor-id']).toBe('actor-789');
        expect(req.headers['x-internal-service']).toBe('fn-runtime');

        // Verify request body
        expect(req.body.model).toBe('gpt-4o');
        expect(req.body.messages).toEqual([
          { role: 'user', content: 'Hello' }
        ]);

        // Verify response shape
        expect(result.content).toBe('Hello from mock LLM');
        expect(result.usage.totalTokens).toBe(15);
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });

    it('embed() sends a request to /v1/embeddings with correct headers', async () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      process.env.AGENTIC_SERVER_URL = `http://localhost:${mockPort}`;

      try {
        const context = buildContext({
          databaseId: 'db-test-123',
          entityId: 'entity-456',
          actorId: 'actor-789'
        });

        const result = await context.agent.embed('test text');

        // Verify the mock server received the request
        expect(receivedRequests).toHaveLength(1);
        const req = receivedRequests[0];
        expect(req.path).toBe('/v1/embeddings');
        expect(req.method).toBe('POST');

        // Verify identity headers
        expect(req.headers['x-database-id']).toBe('db-test-123');
        expect(req.headers['x-entity-id']).toBe('entity-456');

        // Verify request body
        expect(req.body.input).toBe('test text');

        // Verify response shape
        expect(result.embeddings).toHaveLength(1);
        expect(result.embeddings[0]).toEqual([0.1, 0.2, 0.3]);
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });

    it('inference() passes optional parameters (temperature, tools)', async () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      process.env.AGENTIC_SERVER_URL = `http://localhost:${mockPort}`;

      try {
        const context = buildContext({
          databaseId: 'db-test-123',
          entityId: 'entity-456'
        });

        await context.agent.inference({
          messages: [{ role: 'user', content: 'What is 2+2?' }],
          model: 'gpt-4o-mini',
          temperature: 0.5
        });

        const req = receivedRequests[0];
        expect(req.body.model).toBe('gpt-4o-mini');
        expect(req.body.temperature).toBe(0.5);
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });
  });

  describe('when AGENTIC_SERVER_URL is NOT set', () => {
    it('provides a stub that throws descriptive errors', async () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      delete process.env.AGENTIC_SERVER_URL;

      try {
        const context = buildContext({
          databaseId: 'db-test-123',
          entityId: 'entity-456'
        });

        expect(context.agent).toBeDefined();

        // Calling inference should throw
        await expect(
          context.agent.inference({
            messages: [{ role: 'user', content: 'Hello' }]
          })
        ).rejects.toThrow(/AGENTIC_SERVER_URL/);

        // Calling embed should throw
        await expect(
          context.agent.embed('test')
        ).rejects.toThrow(/AGENTIC_SERVER_URL/);
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });

    it('still exposes databaseId and entityId', () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      delete process.env.AGENTIC_SERVER_URL;

      try {
        const context = buildContext({
          databaseId: 'db-test-123',
          entityId: 'entity-456'
        });

        expect(context.agent.databaseId).toBe('db-test-123');
        expect(context.agent.entityId).toBe('entity-456');
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });
  });

  describe('header security', () => {
    it('always sets X-Internal-Service header to fn-runtime', async () => {
      const savedEnv = process.env.AGENTIC_SERVER_URL;
      process.env.AGENTIC_SERVER_URL = `http://localhost:${mockPort}`;

      try {
        const context = buildContext({
          databaseId: 'db-secure-1',
          entityId: 'entity-secure-1',
          actorId: 'actor-secure-1'
        });

        await context.agent.inference({
          messages: [{ role: 'user', content: 'test' }]
        });

        const req = receivedRequests[0];
        expect(req.headers['x-internal-service']).toBe('fn-runtime');
      } finally {
        if (savedEnv === undefined) delete process.env.AGENTIC_SERVER_URL;
        else process.env.AGENTIC_SERVER_URL = savedEnv;
      }
    });
  });
});
