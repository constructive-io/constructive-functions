/**
 * Standalone entry point for the agentic server.
 *
 * Reads configuration from environment variables:
 *   PORT                 — Server port (default: 3003)
 *   LLM_PROVIDER_URL     — Upstream LLM provider base URL (required)
 *   LLM_PROVIDER_API_KEY — API key for the upstream provider
 *   LLM_PROVIDER_TYPE    — Provider type: openai | ollama | anthropic (default: openai)
 *   LLM_DEFAULT_MODEL    — Default model name (default: gpt-4o)
 */

import { createAgenticServer } from './server';
import { Logger } from '@pgpmjs/logger';

const log = new Logger('agentic-server');

const port = Number(process.env.PORT || 3003);
const providerBaseUrl = process.env.LLM_PROVIDER_URL || 'http://localhost:11434';
const providerApiKey = process.env.LLM_PROVIDER_API_KEY;
const providerType = process.env.LLM_PROVIDER_TYPE || 'ollama';
const defaultModel = process.env.LLM_DEFAULT_MODEL;

const app = createAgenticServer({
  providerBaseUrl,
  providerApiKey,
  providerType,
  defaultModel
});

app.listen(port, () => {
  log.info(`Agentic server listening on port ${port}`);
  log.info(`Provider: ${providerType} @ ${providerBaseUrl}`);
  if (defaultModel) log.info(`Default model: ${defaultModel}`);
});
