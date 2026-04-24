import type { Pool, PoolClient } from 'pg';

export type FunctionHandler<P = unknown, R = unknown> = (
  params: P,
  context: FunctionContext
) => Promise<R> | R;

export type Logger = {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export type FunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
  };
  pool: Pool;
  withUserContext: <T>(actorId: string | undefined, fn: (client: PoolClient) => Promise<T>) => Promise<T>;
  log: Logger;
  env: Record<string, string | undefined>;
};
