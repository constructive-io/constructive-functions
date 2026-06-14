import { createLogger } from '@pgpmjs/logger';
import type { FunctionContext } from '@constructive-io/fn-types';
import { createClients } from './graphql';
import { createAgentContext } from './agent';
import { createStorageContext, type StorageMeterCallback } from './storage';

type RequestHeaders = {
  databaseId?: string;
  actorId?: string;
  entityId?: string;
  workerId?: string;
  jobId?: string;
};

export const buildContext = (
  headers: RequestHeaders,
  options: { name?: string; onStorageMeter?: StorageMeterCallback } = {}
): FunctionContext => {
  const env = process.env as Record<string, string | undefined>;
  const log = createLogger(options.name || 'fn-runtime');

  const { databaseId, actorId, entityId, workerId, jobId } = headers;

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

  // Create agent context for LLM inference via the agentic server.
  // Identity headers (databaseId, entityId, actorId) flow from the job context
  // and are set server-side — they cannot be forged by the function caller.
  const agent = createAgentContext(env.AGENTIC_SERVER_URL, {
    databaseId,
    entityId,
    actorId
  });

  // Create storage context for S3/MinIO operations with metering.
  const storage = createStorageContext(
    env,
    { databaseId, entityId, actorId },
    options.onStorageMeter
  );

  return {
    job: { jobId, workerId, databaseId, actorId, entityId },
    client,
    meta,
    agent,
    storage,
    log,
    env
  };
};
