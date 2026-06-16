// Inline type to avoid requiring fn-runtime to be built for unit tests.
// Mirrors FunctionContext from packages/fn-runtime/src/types.ts (node-graphql)
// and generated/*/types.ts (node-sql)
type FunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
  };
  client: { request: (...args: any[]) => Promise<any> };
  meta: { request: (...args: any[]) => Promise<any> };
  log: {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
  };
  env: Record<string, string | undefined>;
  // node-sql template fields
  pool?: any;
  withUserContext?: any;
};

type MockContextOptions = {
  env?: Record<string, string | undefined>;
  databaseId?: string;
  clientResponse?: any;
  metaResponse?: any;
  pool?: any;
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
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  env: options.env ?? {},
  pool: options.pool,
  withUserContext: jest.fn()
});
