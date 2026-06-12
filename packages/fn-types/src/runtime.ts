import type { GraphQLClient } from 'graphql-request';

export type FunctionHandler<P = unknown, R = unknown> = (
  params: P,
  context: FunctionContext
) => Promise<R> | R;

export type FunctionLogger = {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export type FunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
    actorId?: string;
    entityId?: string;
    /** Present when this function is running as a graph node */
    executionId?: string;
    /** Present when this function is running as a graph node */
    nodeName?: string;
  };
  client: GraphQLClient;
  meta: GraphQLClient;
  log: FunctionLogger;
  env: Record<string, string | undefined>;
};

export type ServerOptions = {
  name?: string;
};
