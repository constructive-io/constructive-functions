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
  request: (...args: any[]) => Promise<any>;
  metaRequest: (...args: any[]) => Promise<any>;
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
): FunctionContext => {
  const clientRequest = jest.fn().mockResolvedValue(options.clientResponse ?? {});
  const metaRequest = jest.fn().mockResolvedValue(options.metaResponse ?? {});

  return {
    job: {
      jobId: 'test-job',
      workerId: 'test-worker',
      databaseId: 'databaseId' in options ? options.databaseId : 'test-db'
    },
    client: { request: clientRequest } as any,
    meta: { request: metaRequest } as any,
    request: clientRequest,
    metaRequest: metaRequest,
    log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
    env: options.env ?? {}
  };
};
