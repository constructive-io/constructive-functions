const mockRequest = jest.fn();

jest.mock('graphql-request', () => ({
  gql: jest.fn((strings: TemplateStringsArray) => strings.join('')),
}));

jest.mock('@agentic-kit/ollama', () => {
  return jest.fn().mockImplementation(() => ({
    generateEmbedding: jest.fn().mockResolvedValue(Array(768).fill(0.1)),
  }));
});

jest.mock('@constructive-io/graphql-query', () => ({
  SCHEMA_INTROSPECTION_QUERY: 'query { __schema { types { name } } }',
  inferTablesFromIntrospection: jest.fn().mockReturnValue([
    {
      name: 'article',
      query: { all: 'articles', create: 'createArticle' },
      inflection: { allRows: 'articles', tableFieldName: 'article' },
      primaryKey: 'id',
      relations: { belongsTo: [], hasMany: [] },
    },
    {
      name: 'article_chunk',
      query: { all: 'articleChunks', create: 'createArticleChunk' },
      inflection: { allRows: 'articleChunks', tableFieldName: 'articleChunk', createField: 'createArticleChunk' },
      primaryKey: 'id',
      relations: {
        belongsTo: [{ referencesTable: 'article', fieldName: 'article' }],
        hasMany: [],
      },
    },
  ]),
  buildSelect: jest.fn().mockReturnValue({ toString: () => 'query { articles { nodes { id content } } }' }),
  buildPostGraphileCreate: jest.fn().mockReturnValue({ toString: () => 'mutation { createArticleChunk { articleChunk { id } } }' }),
  buildPostGraphileDelete: jest.fn().mockReturnValue({ toString: () => 'mutation { deleteArticleChunks { deletedCount } }' }),
}));

const createMockContext = () => ({
  job: {
    jobId: 'test-job-id',
    workerId: 'test-worker',
    databaseId: 'test-db',
  },
  client: {
    request: mockRequest,
  },
  meta: {
    request: jest.fn().mockResolvedValue({
      schemas: { nodes: [{ schemaName: 'test-db-app-public' }] },
    }),
  },
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  env: {
    RAG_EMBEDDING_DRY_RUN: 'true',
    GRAPHQL_URL: 'http://localhost:3000/graphql',
    GRAPHQL_API_NAME: 'private',
  },
});

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('rag-embedding handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockReset();
  });

  it('should return early when content is empty', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        articles: { nodes: [{ id: 'test-id', content: '' }] },
      });

    const result = await handler(
      {
        table: 'article',
        schema: 'test-db-app-public',
        id: 'test-id',
        chunks_table: 'article_chunk',
      },
      context
    );

    expect(result.complete).toBe(true);
    expect(result.chunks).toBe(0);
  });

  it('should chunk content and create embeddings', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        articles: { nodes: [{ id: 'test-id', content: 'This is test content for chunking.' }] },
      })
      .mockResolvedValueOnce({ deleteArticleChunks: { deletedCount: 0 } })
      .mockResolvedValueOnce({
        createArticleChunk: { articleChunk: { id: 'chunk-1' } },
      });

    const result = await handler(
      {
        table: 'article',
        schema: 'test-db-app-public',
        id: 'test-id',
        chunks_table: 'article_chunk',
        chunk_size: '1000',
      },
      context
    );

    expect(result.complete).toBe(true);
    expect(result.chunks).toBe(1);
    expect(result.chunk_ids).toHaveLength(1);
  });

  it('should throw error when databaseId is missing', async () => {
    const handler = loadHandler();
    const context = createMockContext();
    context.job.databaseId = undefined;

    await expect(
      handler({ table: 'article', schema: 'test-db-app-public', id: 'test-id', chunks_table: 'article_chunk' }, context)
    ).rejects.toThrow('Missing X-Database-Id');
  });

  it('should throw error when required params are missing', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    await expect(
      handler({ table: '', schema: 'test-db-app-public', id: 'test-id', chunks_table: 'article_chunk' }, context)
    ).rejects.toThrow('Missing required params');
  });

  it('should return early when content is empty with trigger format', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        articles: { nodes: [{ id: 'test-id', content: '' }] },
      });

    const result = await handler(
      {
        table: 'article',
        schema: 'test-db-app-public',
        id: 'test-id',
        chunks_table: 'article_chunk',
      },
      context
    );

    expect(result.complete).toBe(true);
    expect(result.chunks).toBe(0);
  });
});
