// Inline type to avoid requiring fn-runtime to be built for unit tests.
// Mirrors FunctionContext from packages/fn-runtime/src/types.ts
type FunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
  };
  client: { request: (...args: any[]) => Promise<any> };
  meta: { request: (...args: any[]) => Promise<any> };
  agent: {
    inference: (...args: any[]) => Promise<any>;
    embed: (...args: any[]) => Promise<any>;
    readonly databaseId: string | undefined;
    readonly entityId: string | undefined;
  };
  log: {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
  };
  env: Record<string, string | undefined>;
};

type MockContextOptions = {
  env?: Record<string, string | undefined>;
  databaseId?: string;
  clientResponse?: any;
  metaResponse?: any;
};

export const createMockContext = (
  options: MockContextOptions = {}
): FunctionContext => ({
  job: {
    jobId: 'test-job',
    workerId: 'test-worker',
    databaseId: 'databaseId' in options ? options.databaseId : 'test-db'
  },
  client: {
    request: jest.fn().mockResolvedValue(options.clientResponse ?? {})
  } as any,
  meta: {
    request: jest.fn().mockResolvedValue(options.metaResponse ?? {})
  } as any,
  agent: {
    inference: jest.fn().mockRejectedValue(new Error('AGENTIC_SERVER_URL not set')),
    embed: jest.fn().mockRejectedValue(new Error('AGENTIC_SERVER_URL not set')),
    get databaseId() { return options.databaseId ?? 'test-db'; },
    get entityId() { return undefined; }
  },
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  env: options.env ?? {}
});
