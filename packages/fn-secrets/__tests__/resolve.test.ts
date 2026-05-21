import { resolveSecrets, resolveSecretsRaw } from '../src/resolve';
import type { FunctionContext } from '@constructive-io/fn-types';
import { GraphQLClient } from 'graphql-request';

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

const MockedGraphQLClient = GraphQLClient as jest.MockedClass<typeof GraphQLClient>;

const createMockContext = (
  options: {
    databaseId?: string;
    clientRequest?: jest.Mock;
  } = {}
): FunctionContext => {
  const mockRequest = options.clientRequest ?? jest.fn();
  return {
    job: {
      jobId: 'test-job',
      workerId: 'test-worker',
      databaseId: 'databaseId' in options ? options.databaseId : 'test-db-uuid'
    },
    client: { request: mockRequest } as any,
    meta: { request: jest.fn() } as any,
    log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
    env: {
      GRAPHQL_URL: 'http://localhost:3002/graphql'
    }
  };
};

describe('resolveSecrets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns secrets map with resolved values', async () => {
    const mockRequest = jest.fn()
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: {
          nodes: [{ id: 'fn-uuid-123' }]
        }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: [
          { secretName: 'TWILIO_ACCOUNT_SID', secretValue: 'AC123', secretSource: 'global' },
          { secretName: 'TWILIO_AUTH_TOKEN', secretValue: 'token456', secretSource: 'database' }
        ]
      });

    const ctx = createMockContext({ clientRequest: mockRequest });
    const secrets = await resolveSecrets(ctx, 'send-sms');

    expect(secrets).toEqual({
      TWILIO_ACCOUNT_SID: 'AC123',
      TWILIO_AUTH_TOKEN: 'token456'
    });
  });

  it('filters out null values (optional secrets)', async () => {
    const mockRequest = jest.fn()
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: {
          nodes: [{ id: 'fn-uuid-123' }]
        }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: [
          { secretName: 'TWILIO_ACCOUNT_SID', secretValue: 'AC123', secretSource: 'global' },
          { secretName: 'OPTIONAL_KEY', secretValue: null, secretSource: null }
        ]
      });

    const ctx = createMockContext({ clientRequest: mockRequest });
    const secrets = await resolveSecrets(ctx, 'send-sms');

    expect(secrets).toEqual({
      TWILIO_ACCOUNT_SID: 'AC123'
    });
    expect(secrets).not.toHaveProperty('OPTIONAL_KEY');
  });

  it('returns empty object when function has no secret requirements', async () => {
    const mockRequest = jest.fn()
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: {
          nodes: [{ id: 'fn-uuid-123' }]
        }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    const ctx = createMockContext({ clientRequest: mockRequest });
    const secrets = await resolveSecrets(ctx, 'no-secrets-fn');

    expect(secrets).toEqual({});
  });

  it('throws when databaseId is missing', async () => {
    const ctx = createMockContext({ databaseId: undefined });

    await expect(resolveSecrets(ctx, 'send-sms')).rejects.toThrow(
      'Cannot resolve secrets: missing databaseId in context.job'
    );
  });

  it('throws when function not found', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({
      defaultFunctionDefinitions: {
        nodes: []
      }
    });

    const ctx = createMockContext({ clientRequest: mockRequest });

    await expect(resolveSecrets(ctx, 'unknown-fn')).rejects.toThrow(
      'Function "unknown-fn" not found in default_function_definitions'
    );
  });

  it('uses context.client with X-Schemata header override', async () => {
    const mockRequest = jest.fn()
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: { nodes: [{ id: 'fn-uuid' }] }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    const ctx = createMockContext({ clientRequest: mockRequest });
    await resolveSecrets(ctx, 'send-sms');

    expect(mockRequest).toHaveBeenCalledTimes(2);
    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('GetFunctionId'),
      { name: 'send-sms' },
      { 'X-Schemata': 'infra_private,infra_public' }
    );
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('resolveFunctionSecrets'),
      expect.objectContaining({ functionId: 'fn-uuid', databaseId: 'test-db-uuid' }),
      { 'X-Schemata': 'infra_private,infra_public' }
    );
  });

  it('supports custom schemata option', async () => {
    const mockRequest = jest.fn()
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: { nodes: [{ id: 'fn-uuid' }] }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    const ctx = createMockContext({ clientRequest: mockRequest });
    await resolveSecrets(ctx, 'send-sms', { schemata: 'custom_private,custom_public' });

    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.any(Object),
      { 'X-Schemata': 'custom_private,custom_public' }
    );
  });
});

describe('resolveSecretsRaw', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = jest.fn();
    MockedGraphQLClient.mockImplementation(() => ({
      request: mockRequest
    }) as unknown as GraphQLClient);
  });

  it('returns raw array with secretSource', async () => {
    mockRequest
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: { nodes: [{ id: 'fn-uuid' }] }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: [
          { secretName: 'KEY1', secretValue: 'val1', secretSource: 'global' },
          { secretName: 'KEY2', secretValue: 'val2', secretSource: 'database' }
        ]
      });

    const result = await resolveSecretsRaw({
      functionName: 'test-fn',
      databaseId: 'db-uuid',
      graphqlUrl: 'http://localhost:3002/graphql'
    });

    expect(result).toEqual([
      { secretName: 'KEY1', secretValue: 'val1', secretSource: 'global' },
      { secretName: 'KEY2', secretValue: 'val2', secretSource: 'database' }
    ]);
  });

  it('skips function lookup when functionId is provided', async () => {
    mockRequest.mockResolvedValueOnce({
      resolveFunctionSecrets: [
        { secretName: 'KEY1', secretValue: 'val1', secretSource: 'global' }
      ]
    });

    await resolveSecretsRaw({
      functionName: 'ignored',
      functionId: 'provided-fn-uuid',
      databaseId: 'db-uuid',
      graphqlUrl: 'http://localhost:3002/graphql'
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('resolveFunctionSecrets'),
      expect.objectContaining({ functionId: 'provided-fn-uuid' })
    );
  });

  it('uses custom secretsSchema and secretsGetter', async () => {
    mockRequest
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: { nodes: [{ id: 'fn-uuid' }] }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    await resolveSecretsRaw({
      functionName: 'test-fn',
      databaseId: 'db-uuid',
      graphqlUrl: 'http://localhost:3002/graphql',
      secretsSchema: 'custom_store_private',
      secretsGetter: 'custom_secrets_get'
    });

    expect(mockRequest).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        secretsSchema: 'custom_store_private',
        secretsGetter: 'custom_secrets_get'
      })
    );
  });

  it('creates standalone GraphQL client with correct headers', async () => {
    mockRequest
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: { nodes: [{ id: 'fn-uuid' }] }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    await resolveSecretsRaw({
      functionName: 'test-fn',
      databaseId: 'db-uuid',
      graphqlUrl: 'http://localhost:3002/graphql'
    });

    expect(MockedGraphQLClient).toHaveBeenCalledWith(
      'http://localhost:3002/graphql',
      {
        headers: {
          'X-Database-Id': 'db-uuid',
          'X-Schemata': 'infra_private,infra_public'
        }
      }
    );
  });
});
