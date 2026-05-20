import { resolveSecrets, resolveSecretsRaw } from '../src/resolve';
import type { FunctionContext } from '@constructive-io/fn-types';

jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

const { GraphQLClient } = require('graphql-request');

const createMockContext = (
  options: {
    databaseId?: string;
    graphqlUrl?: string | null;
  } = {}
): FunctionContext => ({
  job: {
    jobId: 'test-job',
    workerId: 'test-worker',
    databaseId: 'databaseId' in options ? options.databaseId : 'test-db-uuid'
  },
  client: { request: jest.fn() } as any,
  meta: { request: jest.fn() } as any,
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  env: {
    GRAPHQL_URL: 'graphqlUrl' in options
      ? (options.graphqlUrl ?? undefined)
      : 'http://localhost:3002/graphql'
  }
});

describe('resolveSecrets', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = jest.fn();
    (GraphQLClient as jest.Mock).mockImplementation(() => ({
      request: mockRequest
    }));
  });

  it('returns secrets map with resolved values', async () => {
    mockRequest
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

    const ctx = createMockContext();
    const secrets = await resolveSecrets(ctx, 'send-sms');

    expect(secrets).toEqual({
      TWILIO_ACCOUNT_SID: 'AC123',
      TWILIO_AUTH_TOKEN: 'token456'
    });
  });

  it('filters out null values (optional secrets)', async () => {
    mockRequest
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

    const ctx = createMockContext();
    const secrets = await resolveSecrets(ctx, 'send-sms');

    expect(secrets).toEqual({
      TWILIO_ACCOUNT_SID: 'AC123'
    });
    expect(secrets).not.toHaveProperty('OPTIONAL_KEY');
  });

  it('returns empty object when function has no secret requirements', async () => {
    mockRequest
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: {
          nodes: [{ id: 'fn-uuid-123' }]
        }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    const ctx = createMockContext();
    const secrets = await resolveSecrets(ctx, 'no-secrets-fn');

    expect(secrets).toEqual({});
  });

  it('throws when databaseId is missing', async () => {
    const ctx = createMockContext({ databaseId: undefined });

    await expect(resolveSecrets(ctx, 'send-sms')).rejects.toThrow(
      'Cannot resolve secrets: missing databaseId in context.job'
    );
  });

  it('throws when GRAPHQL_URL is missing', async () => {
    const ctx = createMockContext({ graphqlUrl: null });

    await expect(resolveSecrets(ctx, 'send-sms')).rejects.toThrow(
      'Cannot resolve secrets: missing GRAPHQL_URL in environment'
    );
  });

  it('throws when function not found', async () => {
    mockRequest.mockResolvedValueOnce({
      defaultFunctionDefinitions: {
        nodes: []
      }
    });

    const ctx = createMockContext();

    await expect(resolveSecrets(ctx, 'unknown-fn')).rejects.toThrow(
      'Function "unknown-fn" not found in default_function_definitions'
    );
  });

  it('creates GraphQL client with correct headers', async () => {
    mockRequest
      .mockResolvedValueOnce({
        defaultFunctionDefinitions: { nodes: [{ id: 'fn-uuid' }] }
      })
      .mockResolvedValueOnce({
        resolveFunctionSecrets: []
      });

    const ctx = createMockContext();
    await resolveSecrets(ctx, 'send-sms');

    expect(GraphQLClient).toHaveBeenCalledWith(
      'http://localhost:3002/graphql',
      {
        headers: {
          'X-Database-Id': 'test-db-uuid',
          'X-Schemata': 'infra_private,infra_public'
        }
      }
    );
  });
});

describe('resolveSecretsRaw', () => {
  let mockRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = jest.fn();
    (GraphQLClient as jest.Mock).mockImplementation(() => ({
      request: mockRequest
    }));
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
});
