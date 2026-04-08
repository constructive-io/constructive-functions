// Import the mock request function from the manual mock
import { mockRequest as mockRequestFn } from '../../../tests/__mocks__/graphql-request';

// Mock @constructive-io/graphql-query before importing handler
jest.mock('@constructive-io/graphql-query', () => ({
  SCHEMA_INTROSPECTION_QUERY: 'query IntrospectSchema { __schema { types { name } } }',
  inferTablesFromIntrospection: jest.fn().mockReturnValue([
    {
      name: 'Articles',
      fields: [
        { name: 'id', type: { gqlType: 'UUID', isArray: false } },
        { name: 'content', type: { gqlType: 'String', isArray: false } }
      ],
      relations: { belongsTo: [], hasOne: [], hasMany: [], manyToMany: [] },
      query: { all: 'articles', one: 'article', create: 'createArticles', delete: 'deleteArticles', patchFieldName: 'articles' },
      inflection: { allRows: 'articles', tableFieldName: 'articles' }
    },
    {
      name: 'ArticlesChunks',
      fields: [
        { name: 'id', type: { gqlType: 'UUID', isArray: false } },
        { name: 'content', type: { gqlType: 'String', isArray: false } },
        { name: 'chunkIndex', type: { gqlType: 'Int', isArray: false } },
        { name: 'embedding', type: { gqlType: 'Vector', isArray: false } },
        { name: 'metadata', type: { gqlType: 'JSON', isArray: false } }
      ],
      relations: {
        belongsTo: [{ fieldName: 'articles', referencesTable: 'Articles', type: 'Articles', keys: [], isUnique: false }],
        hasOne: [],
        hasMany: [],
        manyToMany: []
      },
      query: { all: 'articlesChunks', one: 'articlesChunk', create: 'createArticlesChunks', delete: 'deleteArticlesChunks', patchFieldName: 'articlesChunks' },
      inflection: { allRows: 'articlesChunks', tableFieldName: 'articlesChunks' }
    }
  ]),
  buildSelect: jest.fn().mockReturnValue({
    toString: () => 'query SelectQuery($where: Filter) { items(where: $where) { nodes { id content } } }'
  }),
  buildPostGraphileCreate: jest.fn().mockReturnValue({
    toString: () => 'mutation CreateMutation($input: CreateInput!) { createItem(input: $input) { item { id } } }'
  }),
  buildPostGraphileDelete: jest.fn().mockReturnValue({
    toString: () => 'mutation DeleteMutation($input: DeleteInput!) { deleteItem(input: $input) { clientMutationId } }'
  })
}));

import handler from '../../../generated/rag-embedding/handler';

// Mock Ollama client
jest.mock('@agentic-kit/ollama', () => {
  return jest.fn().mockImplementation(() => ({
    generateEmbedding: jest.fn().mockResolvedValue(new Array(768).fill(0.1))
  }));
});

describe('rag-embedding handler', () => {
  const mockLog = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  };

  const mockEnv = {
    GRAPHQL_URL: 'http://localhost:3000/graphql',
    OLLAMA_URL: 'http://localhost:11434',
    EMBEDDING_MODEL: 'nomic-embed-text:latest'
  };

  const createContext = () => ({
    job: {
      jobId: 'test-job',
      workerId: 'test-worker',
      databaseId: 'test-db-id'
    },
    log: mockLog,
    env: mockEnv
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should chunk article content and create embeddings', async () => {
    const articleContent = 'This is a test article. It has multiple sentences. We want to test chunking.';

    mockRequestFn.mockImplementation((query: string, variables?: Record<string, unknown>) => {
      // First request is introspection
      if (query.includes('IntrospectSchema') || query.includes('__schema')) {
        return Promise.resolve({ __schema: { types: [] } });
      }
      // Content query - return article content
      if ((variables?.where as Record<string, Record<string, string>>)?.id?.equalTo === 'test-article-id') {
        return Promise.resolve({
          articles: {
            nodes: [{ id: 'test-article-id', content: articleContent }]
          }
        });
      }
      // Chunks query - return empty (no existing chunks)
      if ((variables?.where as Record<string, Record<string, string>>)?.articlesId?.equalTo) {
        return Promise.resolve({
          articlesChunks: { nodes: [] }
        });
      }
      // Delete mutation
      if (query.includes('DeleteMutation')) {
        return Promise.resolve({ deleteArticlesChunks: { clientMutationId: '1' } });
      }
      // Create mutation
      if (query.includes('CreateMutation') || (variables?.input as Record<string, unknown>)?.articlesChunks) {
        return Promise.resolve({
          createArticlesChunks: { articlesChunks: { id: 'chunk-' + Math.random() } }
        });
      }
      return Promise.resolve({});
    });

    const context = createContext();

    const params = {
      table: 'articles',
      schema: 'public',
      id: 'test-article-id',
      chunks_table: 'articles_chunks',
      chunk_size: '50',
      chunk_overlap: '10',
      chunk_strategy: 'fixed' as const
    };

    const result = await handler(params, context as any);

    expect(result.complete).toBe(true);
    expect(result.chunks).toBeGreaterThan(0);
    expect(mockRequestFn).toHaveBeenCalled();
  });

  it('should return 0 chunks for empty content', async () => {
    mockRequestFn.mockImplementation((query: string, variables?: Record<string, unknown>) => {
      // Introspection
      if (query.includes('IntrospectSchema') || query.includes('__schema')) {
        return Promise.resolve({ __schema: { types: [] } });
      }
      // Content query - return empty content
      if ((variables?.where as Record<string, Record<string, string>>)?.id?.equalTo === 'test-article-id') {
        return Promise.resolve({
          articles: {
            nodes: [{ id: 'test-article-id', content: '' }]
          }
        });
      }
      return Promise.resolve({});
    });

    const context = createContext();

    const params = {
      table: 'articles',
      schema: 'public',
      id: 'test-article-id',
      chunks_table: 'articles_chunks',
      chunk_size: '1000',
      chunk_overlap: '200',
      chunk_strategy: 'fixed' as const
    };

    const result = await handler(params, context as any);

    expect(result.complete).toBe(true);
    expect(result.chunks).toBe(0);
  });

  it('should throw error when article not found', async () => {
    mockRequestFn.mockImplementation((query: string) => {
      // Introspection
      if (query.includes('IntrospectSchema') || query.includes('__schema')) {
        return Promise.resolve({ __schema: { types: [] } });
      }
      // Content query - return empty nodes
      return Promise.resolve({
        articles: { nodes: [] }
      });
    });

    const context = createContext();

    const params = {
      table: 'articles',
      schema: 'public',
      id: 'non-existent-id',
      chunks_table: 'articles_chunks',
      chunk_size: '1000',
      chunk_overlap: '200',
      chunk_strategy: 'fixed' as const
    };

    await expect(handler(params, context as any)).rejects.toThrow('Record not found');
  });

  it('should throw error when databaseId is missing', async () => {
    const context = {
      ...createContext(),
      job: { jobId: 'test', workerId: 'test', databaseId: undefined }
    };

    const params = {
      table: 'articles',
      schema: 'public',
      id: 'test-id',
      chunks_table: 'articles_chunks',
      chunk_size: '1000',
      chunk_overlap: '200',
      chunk_strategy: 'fixed' as const
    };

    await expect(handler(params, context as any)).rejects.toThrow('Missing X-Database-Id');
  });

  it('should throw error when GRAPHQL_URL is missing', async () => {
    const context = {
      ...createContext(),
      env: { OLLAMA_URL: 'http://localhost:11434' }
    };

    const params = {
      table: 'articles',
      schema: 'public',
      id: 'test-id',
      chunks_table: 'articles_chunks',
      chunk_size: '1000',
      chunk_overlap: '200',
      chunk_strategy: 'fixed' as const
    };

    await expect(handler(params, context as any)).rejects.toThrow('Missing GRAPHQL_URL');
  });
});
