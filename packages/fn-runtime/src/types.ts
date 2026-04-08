import type { GraphQLClient } from 'graphql-request';

export type FunctionHandler<P = unknown, R = unknown> = (
  params: P,
  context: FunctionContext
) => Promise<R> | R;

export type FunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
  };
  client: GraphQLClient;
  meta: GraphQLClient;
  log: { info: (...args: any[]) => void; error: (...args: any[]) => void; warn: (...args: any[]) => void };
  env: Record<string, string | undefined>;
};

export type ServerOptions = {
  name?: string;
};
