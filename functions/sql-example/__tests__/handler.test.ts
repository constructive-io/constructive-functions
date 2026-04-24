import { mockQuery, mockRelease } from 'pg';

jest.mock('pg');

const createMockContext = () => {
  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };

  return {
    job: {
      jobId: 'test-job-id',
      workerId: 'test-worker',
      databaseId: 'test-db',
    },
    pool: {
      connect: jest.fn().mockResolvedValue(mockClient),
    },
    withUserContext: jest.fn(async (_actorId: string | undefined, fn: (client: typeof mockClient) => Promise<unknown>) => {
      return fn(mockClient);
    }),
    log: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    },
    env: {},
  };
};

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('sql-example handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  it('should execute default query (SELECT version()) when no query provided', async () => {
    const handler = loadHandler();
    const context = createMockContext();
    mockQuery.mockResolvedValueOnce({ rows: [{ version: 'PostgreSQL 15.0' }] });

    const result = await handler({}, context);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Query executed successfully');
    expect(context.withUserContext).toHaveBeenCalledWith(undefined, expect.any(Function));
  });

  it('should execute custom query', async () => {
    const handler = loadHandler();
    const context = createMockContext();
    mockQuery.mockResolvedValueOnce({ rows: [{ count: 5 }] });

    const result = await handler({ query: 'SELECT count(*) FROM users' }, context);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([{ count: 5 }]);
  });

  it('should pass actor_id to withUserContext', async () => {
    const handler = loadHandler();
    const context = createMockContext();
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await handler({ actor_id: 'user-123' }, context);

    expect(context.withUserContext).toHaveBeenCalledWith('user-123', expect.any(Function));
  });
});
