import type { GraphQLClient } from 'graphql-request';
import type { QueryBuilder } from '@constructive-io/graphql-query';

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
  getQueryBuilder: () => Promise<QueryBuilder>;
  getMetaQueryBuilder: () => Promise<QueryBuilder>;
  log: { info: (...args: any[]) => void; error: (...args: any[]) => void; warn: (...args: any[]) => void };
  env: Record<string, string | undefined>;
};

export type ServerOptions = {
  name?: string;
};
