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
      name: 'document',
      query: { all: 'documents', patchFieldName: 'documentPatch' },
      inflection: { allRows: 'documents', patchField: 'documentPatch' },
      primaryKey: 'id',
      relations: { belongsTo: [], hasMany: [] },
    },
  ]),
  buildSelect: jest.fn().mockReturnValue({ toString: () => 'query { documents { nodes { id embeddingText } } }' }),
  buildPostGraphileUpdate: jest.fn().mockReturnValue({ toString: () => 'mutation { updateDocument { document { id } } }' }),
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
    TEXT_EMBEDDING_DRY_RUN: 'true',
    GRAPHQL_URL: 'http://localhost:3000/graphql',
    GRAPHQL_API_NAME: 'private',
  },
});

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('text-embedding handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockReset();
  });

  it('should generate embedding for document with embeddingText', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        documents: { nodes: [{ id: 'doc-1', embeddingText: 'Hello world test content' }] },
      })
      .mockResolvedValueOnce({
        updateDocument: { document: { id: 'doc-1' } },
      });

    const result = await handler(
      {
        table: 'document',
        schema: 'test-db-app-public',
        id: 'doc-1',
        field: 'embedding',
      },
      context
    );

    expect(result.complete).toBe(true);
    expect(result.embedding_dims).toBe(768);
  });

  it('should skip when embeddingText is empty', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        documents: { nodes: [{ id: 'doc-1', embeddingText: '' }] },
      });

    const result = await handler(
      {
        table: 'document',
        schema: 'test-db-app-public',
        id: 'doc-1',
        field: 'embedding',
      },
      context
    );

    expect(result.complete).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('no_embedding_text');
  });

  it('should throw error when databaseId is missing', async () => {
    const handler = loadHandler();
    const context = createMockContext();
    context.job.databaseId = undefined;

    await expect(
      handler(
        { table: 'document', schema: 'test-db-app-public', id: 'doc-1', field: 'embedding' },
        context
      )
    ).rejects.toThrow('Missing X-Database-Id');
  });

  it('should throw error when required params are missing', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    await expect(
      handler({ table: '', schema: 'test-db-app-public', id: 'doc-1', field: 'embedding' }, context)
    ).rejects.toThrow('Missing required params');
  });

  it('should throw error when record is not found', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        documents: { nodes: [] },
      });

    await expect(
      handler(
        { table: 'document', schema: 'test-db-app-public', id: 'nonexistent', field: 'embedding' },
        context
      )
    ).rejects.toThrow('Record not found');
  });

  it('should use custom embedding model when provided', async () => {
    const handler = loadHandler();
    const context = createMockContext();

    mockRequest
      .mockResolvedValueOnce({ __schema: { types: [] } }) // introspection
      .mockResolvedValueOnce({
        documents: { nodes: [{ id: 'doc-1', embeddingText: 'Test content' }] },
      })
      .mockResolvedValueOnce({
        updateDocument: { document: { id: 'doc-1' } },
      });

    const result = await handler(
      {
        table: 'document',
        schema: 'test-db-app-public',
        id: 'doc-1',
        field: 'embedding',
        embedding_model: 'mxbai-embed-large',
      },
      context
    );

    expect(result.complete).toBe(true);
    expect(result.model).toBe('mxbai-embed-large');
  });
});
