import { createMockContext } from '../../../tests/helpers/mock-context';

jest.mock('graphile-llm', () => ({
  buildEmbedderFromEnv: jest.fn().mockReturnValue(
    jest.fn().mockResolvedValue({
      embedding: Array(768).fill(0.1),
      promptTokens: 10
    })
  )
}));

jest.mock('pg', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn(),
    end: jest.fn().mockResolvedValue(undefined)
  };
  return {
    Client: jest.fn(() => mockClient),
    __mockClient: mockClient
  };
});

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

const getMockClient = () => {
  const pg = require('pg');
  return pg.__mockClient;
};

describe('generate-embedding handler', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.EMBEDDER_PROVIDER = 'ollama';
    process.env.EMBEDDER_MODEL = 'nomic-embed-text';
    process.env.EMBEDDER_BASE_URL = 'http://localhost:11434';
  });

  afterEach(() => {
    delete process.env.EMBEDDER_PROVIDER;
    delete process.env.EMBEDDER_MODEL;
    delete process.env.EMBEDDER_BASE_URL;
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('throws on missing id', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { table: 'items', schema: 'app_public', source_fields: ['title'], target_field: 'embedding' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing source_fields', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { id: '123', table: 'items', schema: 'app_public', target_field: 'embedding' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on empty source_fields array', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { id: '123', table: 'items', schema: 'app_public', source_fields: [], target_field: 'embedding' },
          createMockContext()
        )
      ).rejects.toThrow('source_fields must be a non-empty array');
    });
  });

  describe('embedding generation', () => {
    it('embeds single field', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ title: 'Test Title' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await handler(
        {
          id: '123',
          table: 'items',
          schema: 'app_public',
          source_fields: ['title'],
          target_field: 'embedding'
        },
        createMockContext()
      );

      expect(result.complete).toBe(true);
      expect(result.embedded).toBe(true);
      expect(result.embedding_dim).toBe(768);
    });

    it('concatenates multiple fields', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ title: 'Test Title', description: 'Test Description' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await handler(
        {
          id: '123',
          table: 'items',
          schema: 'app_public',
          source_fields: ['title', 'description'],
          target_field: 'embedding'
        },
        createMockContext()
      );

      expect(result.complete).toBe(true);
      expect(result.embedded).toBe(true);
    });

    it('handles empty text gracefully', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query.mockResolvedValueOnce({ rows: [{ title: '', description: null }] });

      const result = await handler(
        {
          id: '123',
          table: 'items',
          schema: 'app_public',
          source_fields: ['title', 'description'],
          target_field: 'embedding'
        },
        createMockContext()
      );

      expect(result.complete).toBe(true);
      expect(result.embedded).toBe(false);
      expect(result.reason).toBe('no_text');
    });

    it('updates stale field to false', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ title: 'Test' }] })
        .mockResolvedValueOnce({ rows: [] });

      await handler(
        {
          id: '123',
          table: 'items',
          schema: 'app_public',
          source_fields: ['title'],
          target_field: 'embedding'
        },
        createMockContext()
      );

      const updateCall = mockClient.query.mock.calls[1];
      expect(updateCall[0]).toContain('embedding_stale');
      expect(updateCall[0]).toContain('false');
    });
  });

  describe('error handling', () => {
    it('throws when record not found', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        handler(
          {
            id: '123',
            table: 'items',
            schema: 'app_public',
            source_fields: ['title'],
            target_field: 'embedding'
          },
          createMockContext()
        )
      ).rejects.toThrow('Record not found');
    });
  });
});
