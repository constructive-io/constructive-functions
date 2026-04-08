import type { GraphQLClient, RequestDocument, Variables } from 'graphql-request';

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
  /**
   * Make a GraphQL request with optional custom headers.
   * Uses the main GraphQL client (GRAPHQL_URL).
   */
  request: <T = unknown>(
    document: RequestDocument,
    variables?: Variables,
    headers?: HeadersInit
  ) => Promise<T>;
  /**
   * Make a GraphQL request to the meta endpoint with optional custom headers.
   * Uses the meta GraphQL client (META_GRAPHQL_URL).
   */
  metaRequest: <T = unknown>(
    document: RequestDocument,
    variables?: Variables,
    headers?: HeadersInit
  ) => Promise<T>;
  log: { info: (...args: any[]) => void; error: (...args: any[]) => void; warn: (...args: any[]) => void };
  env: Record<string, string | undefined>;
};

export type ServerOptions = {
  name?: string;
};
