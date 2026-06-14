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
 *   - context: { client, meta, agent, log, env, job }
 *     - client/meta: GraphQL clients (tenant-scoped)
 *     - agent: AgentContext for LLM inference (metered, tenant-isolated)
 *       - agent.inference({ messages, model?, temperature? })
 *       - agent.embed(input, model?)
 *     - log: structured logger
 *     - env: process.env
 *     - job: { jobId, workerId, databaseId, actorId }
 */
const handler: FunctionHandler = async (params: any, context) => {
  const { log } = context;

  if (params.throw) {
    throw new Error('THROWN_ERROR');
  }

  log.info('node-example received payload', { params });

  // Example: LLM inference (requires AGENTIC_SERVER_URL to be set)
  // const result = await context.agent.inference({
  //   messages: [{ role: 'user', content: 'Hello!' }],
  //   model: 'gpt-4o'
  // });
  // log.info('LLM response:', result.content);

  return {
    status: 'ok',
    received: params,
    timestamp: new Date().toISOString()
  };
};

export default handler;
