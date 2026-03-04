import type { RequestHeaders } from '@constructive-io/fn-core';
import { createLogger } from '@pgpmjs/logger';
import { createClients } from './graphql';
import type { FunctionContext, ServerOptions } from './types';

export const buildContext = (
  headers: RequestHeaders,
  options: ServerOptions = {}
): FunctionContext => {
  const env = process.env as Record<string, string | undefined>;
  const log = createLogger(options.name || 'fn-runtime');

  const { databaseId, workerId, jobId } = headers;

  // Create GraphQL clients if databaseId is available and GRAPHQL_URL is set
  let client: FunctionContext['client'];
  let meta: FunctionContext['meta'];

  if (databaseId && env.GRAPHQL_URL) {
    const clients = createClients(databaseId, env);
    client = clients.client;
    meta = clients.meta;
  } else {
    // Provide a stub that throws if used — functions that don't need GraphQL
    // won't call these, but we still need the shape for type safety.
    const stub = new Proxy({} as FunctionContext['client'], {
      get(_, prop) {
        if (prop === 'request') {
          return () => {
            throw new Error(
              'GraphQL client not available. Set GRAPHQL_URL and ensure X-Database-Id header is present.'
            );
          };
        }
        return undefined;
      }
    });
    client = stub;
    meta = stub;
  }

  return {
    job: { jobId, workerId, databaseId },
    client,
    meta,
    log,
    env
  };
};
