import type { FunctionHandler } from '@constructive-io/fn-runtime';

/**
 * Example Node.js function handler.
 *
 * Copy this directory to create a new function:
 *   1. cp -r functions/example functions/my-function
 *   2. Edit handler.json (name, description, secrets, configs)
 *   3. Implement your logic here
 *   4. Run: make register && pgpm kill && make up
 *
 * The handler receives:
 *   - params: the job payload (JSON from the caller)
 *   - context: { client, meta, log, env, job }
 *     - client/meta: GraphQL clients (tenant-scoped)
 *     - log: structured logger
 *     - env: process.env
 *     - job: { jobId, workerId, databaseId, actorId }
 */
const handler: FunctionHandler = async (params, context) => {
  const { log } = context;

  log.info('node-example received payload', { params });

  return {
    status: 'ok',
    received: params,
    timestamp: new Date().toISOString()
  };
};

export default handler;
