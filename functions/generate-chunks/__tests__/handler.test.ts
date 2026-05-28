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

describe('generate-chunks handler', () => {
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
          { table: 'documents', schema: 'app_public', chunks_table: 'document_chunks' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing table', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { id: '123', schema: 'app_public', chunks_table: 'document_chunks' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing schema', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { id: '123', table: 'documents', chunks_table: 'document_chunks' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });

    it('throws on missing chunks_table', async () => {
      const handler = loadHandler();
      await expect(
        handler(
          { id: '123', table: 'documents', schema: 'app_public' },
          createMockContext()
        )
      ).rejects.toThrow('Missing required fields');
    });
  });

  describe('chunking strategies', () => {
    it('handles empty text gracefully', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query.mockResolvedValueOnce({
        rows: [{ extracted_text: '' }]
      });

      const result = await handler(
        {
          id: '123',
          table: 'documents',
          schema: 'app_public',
          chunks_table: 'document_chunks'
        },
        createMockContext()
      );

      expect(result).toMatchObject({ complete: true, chunks_created: 0 });
    });

    it('creates chunks with fixed strategy', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      const testText = 'A'.repeat(500) + 'B'.repeat(500) + 'C'.repeat(500);

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ extracted_text: testText }] })
        .mockResolvedValue({ rows: [] });

      const result = await handler(
        {
          id: '123',
          table: 'documents',
          schema: 'app_public',
          chunks_table: 'document_chunks',
          chunk_strategy: 'fixed',
          chunk_size: 1000,
          chunk_overlap: 200
        },
        createMockContext()
      );

      expect(result.complete).toBe(true);
      expect(result.chunks_created).toBeGreaterThan(0);
    });

    it('creates chunks with paragraph strategy', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      const testText = 'Paragraph one content here.\n\nParagraph two content here.\n\nParagraph three.';

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ extracted_text: testText }] })
        .mockResolvedValue({ rows: [] });

      const result = await handler(
        {
          id: '123',
          table: 'documents',
          schema: 'app_public',
          chunks_table: 'document_chunks',
          chunk_strategy: 'paragraph'
        },
        createMockContext()
      );

      expect(result.complete).toBe(true);
      expect(result.chunks_created).toBeGreaterThan(0);
    });

    it('creates chunks with sentence strategy', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      const testText = 'First sentence. Second sentence! Third sentence? Fourth sentence.';

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ extracted_text: testText }] })
        .mockResolvedValue({ rows: [] });

      const result = await handler(
        {
          id: '123',
          table: 'documents',
          schema: 'app_public',
          chunks_table: 'document_chunks',
          chunk_strategy: 'sentence'
        },
        createMockContext()
      );

      expect(result.complete).toBe(true);
    });
  });

  describe('embedding generation', () => {
    it('generates embeddings for each chunk', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();
      const { buildEmbedderFromEnv } = require('graphile-llm');
      const mockEmbedder = buildEmbedderFromEnv();

      const testText = 'Short text for a single chunk.';

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ extracted_text: testText }] })
        .mockResolvedValue({ rows: [] });

      await handler(
        {
          id: '123',
          table: 'documents',
          schema: 'app_public',
          chunks_table: 'document_chunks'
        },
        createMockContext()
      );

      expect(mockEmbedder).toHaveBeenCalled();
    });

    it('reports total prompt tokens', async () => {
      const handler = loadHandler();
      const mockClient = getMockClient();

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ extracted_text: 'Test content.' }] })
        .mockResolvedValue({ rows: [] });

      const result = await handler(
        {
          id: '123',
          table: 'documents',
          schema: 'app_public',
          chunks_table: 'document_chunks'
        },
        createMockContext()
      );

      expect(result.total_prompt_tokens).toBeDefined();
      expect(result.total_prompt_tokens).toBeGreaterThan(0);
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
            table: 'documents',
            schema: 'app_public',
            chunks_table: 'document_chunks'
          },
          createMockContext()
        )
      ).rejects.toThrow('Record not found');
    });
  });
});
