/**
 * @constructive-io/agentic-server — Standalone LLM gateway
 *
 * OpenAI-compatible proxy that:
 *   1. Accepts requests from fn-runtime (cloud functions)
 *   2. Enforces tenant isolation via X-Database-Id / X-Entity-Id headers
 *   3. Proxies to configured LLM provider (OpenAI, Anthropic, Ollama, etc.)
 *   4. Logs usage for billing (when billing endpoint is configured)
 *
 * In constructive-functions standalone mode, this runs as its own Express
 * service on port 3003 alongside the GraphQL server.
 */

export { createAgenticServer } from './server';
export { createRouter } from './router';
