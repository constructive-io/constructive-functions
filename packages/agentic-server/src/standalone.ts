/**
 * Standalone entry point for the agentic server.
 *
 * Configuration via environment variables:
 *   PORT                 — Server port (default: 3003)
 *   LLM_PROVIDER_URL     — Upstream LLM provider base URL (required)
 *   LLM_PROVIDER_API_KEY — API key for the upstream provider
 *   LLM_PROVIDER_TYPE    — Provider type: openai | ollama | anthropic (default: openai)
 *   LLM_DEFAULT_MODEL    — Default model name (default: gpt-4o)
 *
 * Multi-provider (optional — overrides single provider):
 *   LLM_PROVIDERS        — JSON array of provider configs, e.g.:
 *     [{"type":"openai","baseUrl":"https://api.openai.com/v1","apiKey":"sk-..."},
 *      {"type":"anthropic","baseUrl":"https://api.anthropic.com","apiKey":"sk-ant-..."},
 *      {"type":"ollama","baseUrl":"http://localhost:11434"}]
 */

import { createAgenticServer } from './server';
import { Logger } from '@pgpmjs/logger';
import type { ProviderConfig } from './router';

const log = new Logger('agentic-server');

const port = Number(process.env.PORT || 3003);

// Multi-provider config (takes precedence)
let providers: ProviderConfig[] | undefined;
if (process.env.LLM_PROVIDERS) {
  try {
    providers = JSON.parse(process.env.LLM_PROVIDERS);
    log.info(`Multi-provider mode: ${providers!.map((p) => p.type).join(', ')}`);
  } catch (e) {
    log.error('Failed to parse LLM_PROVIDERS — falling back to single provider');
  }
}

// Single provider fallback
const providerBaseUrl = process.env.LLM_PROVIDER_URL || 'http://localhost:11434';
const providerApiKey = process.env.LLM_PROVIDER_API_KEY;
const providerType = process.env.LLM_PROVIDER_TYPE || 'ollama';
const defaultModel = process.env.LLM_DEFAULT_MODEL;

const app = createAgenticServer({
  ...(providers ? { providers } : { providerBaseUrl, providerApiKey, providerType, defaultModel })
});

app.listen(port, () => {
  log.info(`Agentic server listening on port ${port}`);
  if (providers) {
    providers.forEach((p) => log.info(`  ${p.type} @ ${p.baseUrl}`));
  } else {
    log.info(`Provider: ${providerType} @ ${providerBaseUrl}`);
  }
  if (defaultModel) log.info(`Default model: ${defaultModel}`);
});
