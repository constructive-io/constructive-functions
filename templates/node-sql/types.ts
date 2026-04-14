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
  /**
   * Execute a function with RLS user context.
   * Sets jwt.claims.database_id and jwt.claims.user_id, then switches to authenticated role.
   * Wraps execution in a transaction.
   */
  withUserContext: <T>(actorId: string | undefined, fn: (client: PoolClient) => Promise<T>) => Promise<T>;
  log: Logger;
  env: Record<string, string | undefined>;
};
