import { Router } from 'express';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';
import { logInferenceUsage } from './inference-meter';

const log = new Logger('agentic-server');

// ─── Provider Configuration ───────────────────────────────────────────────────

export interface ProviderConfig {
  /** Provider name (e.g. 'openai', 'anthropic', 'ollama') */
  type: string;
  /** Base URL for the provider API */
  baseUrl: string;
  /** API key for authentication (optional for local providers like Ollama) */
  apiKey?: string;
  /** Default model for this provider */
  defaultModel?: string;
}

export interface AgenticRouterOptions {
  /**
   * Primary provider configuration.
   * Legacy: if providerBaseUrl is set directly, it takes precedence.
   */
  providers?: ProviderConfig[];
  /** Legacy: single upstream LLM provider base URL */
  providerBaseUrl?: string;
  /** Legacy: API key for the upstream provider */
  providerApiKey?: string;
  /** Legacy: Default model name */
  defaultModel?: string;
  /** Legacy: Provider type: 'openai' | 'ollama' | 'anthropic' */
  providerType?: string;
  /** Optional pg pool for inference metering (fire-and-forget writes) */
  pgPool?: Pool;
}

// ─── Provider Resolution ──────────────────────────────────────────────────────

interface ResolvedProvider {
  type: string;
  baseUrl: string;
  apiKey?: string;
  defaultModel?: string;
}

/**
 * Resolve which provider to use for a given request.
 * Priority: model-based routing → explicit provider header → default.
 */
function resolveProvider(
  options: AgenticRouterOptions,
  requestModel?: string,
  requestProvider?: string
): ResolvedProvider {
  const providers = options.providers || [];

  // If multi-provider is configured, route by provider name or model prefix
  if (providers.length > 0) {
    // Check X-Provider header first
    if (requestProvider) {
      const match = providers.find((p) => p.type === requestProvider);
      if (match) return match;
    }

    // Route by model prefix: "anthropic/claude-3" → anthropic provider
    if (requestModel && requestModel.includes('/')) {
      const prefix = requestModel.split('/')[0];
      const match = providers.find((p) => p.type === prefix);
      if (match) {
        return { ...match, defaultModel: requestModel.split('/').slice(1).join('/') };
      }
    }

    // Route by known model patterns
    if (requestModel) {
      if (requestModel.startsWith('claude')) {
        const match = providers.find((p) => p.type === 'anthropic');
        if (match) return match;
      }
      if (requestModel.startsWith('gpt') || requestModel.startsWith('o1') || requestModel.startsWith('o3')) {
        const match = providers.find((p) => p.type === 'openai');
        if (match) return match;
      }
      if (requestModel.startsWith('llama') || requestModel.startsWith('mistral') || requestModel.startsWith('gemma')) {
        const match = providers.find((p) => p.type === 'ollama');
        if (match) return match;
      }
    }

    // Fall back to first provider
    return providers[0];
  }

  // Legacy single-provider mode
  return {
    type: options.providerType || 'openai',
    baseUrl: options.providerBaseUrl || 'http://localhost:11434',
    apiKey: options.providerApiKey,
    defaultModel: options.defaultModel
  };
}

// ─── Provider-Specific Transforms ─────────────────────────────────────────────

function resolveUpstreamUrl(provider: ResolvedProvider, path: string): string {
  if (provider.type === 'ollama') {
    if (path === '/v1/chat/completions') return `${provider.baseUrl}/api/chat`;
    if (path === '/v1/embeddings') return `${provider.baseUrl}/api/embed`;
  }
  if (provider.type === 'anthropic') {
    if (path === '/v1/chat/completions') return `${provider.baseUrl}/v1/messages`;
  }
  return `${provider.baseUrl}${path}`;
}

function buildHeaders(provider: ResolvedProvider): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (provider.apiKey) {
    if (provider.type === 'anthropic') {
      headers['x-api-key'] = provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }
  }
  return headers;
}

function transformChatRequest(
  provider: ResolvedProvider,
  body: Record<string, unknown>
): Record<string, unknown> {
  // Strip provider prefix from model name: "anthropic/claude-3" → "claude-3"
  let model = body.model || provider.defaultModel;
  if (typeof model === 'string' && model.includes('/')) {
    const prefix = model.split('/')[0];
    if (prefix === provider.type) {
      model = model.split('/').slice(1).join('/');
    }
  }

  if (provider.type === 'ollama') {
    return {
      model: model || 'llama3',
      messages: body.messages,
      stream: false,
      ...(body.temperature !== undefined && {
        options: { temperature: body.temperature }
      })
    };
  }

  if (provider.type === 'anthropic') {
    const messages = body.messages as Array<{ role: string; content: string }> | undefined;
    const systemMsg = messages?.find((m) => m.role === 'system');
    const nonSystem = messages?.filter((m) => m.role !== 'system') || [];
    return {
      model: model || 'claude-sonnet-4-20250514',
      messages: nonSystem,
      max_tokens: body.max_tokens || 4096,
      ...(systemMsg && { system: systemMsg.content }),
      ...(body.temperature !== undefined && { temperature: body.temperature })
    };
  }

  // OpenAI-compatible (default)
  return { ...body, model: model || 'gpt-4o' };
}

function transformEmbedRequest(
  provider: ResolvedProvider,
  body: Record<string, unknown>
): Record<string, unknown> {
  const model = body.model || provider.defaultModel;

  if (provider.type === 'ollama') {
    return {
      model: model || 'nomic-embed-text',
      input: body.input
    };
  }
  return { ...body, model: model || 'text-embedding-3-small' };
}

interface UsageResult {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

function transformChatResponse(
  data: Record<string, unknown>,
  provider: ResolvedProvider
): { body: Record<string, unknown>; usage: UsageResult } {
  if (provider.type === 'ollama') {
    const msg = data.message as { role: string; content: string } | undefined;
    const promptTokens = (data.prompt_eval_count as number) || 0;
    const completionTokens = (data.eval_count as number) || 0;
    const usage = { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens };
    return {
      body: {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        choices: [{ message: msg || { role: 'assistant', content: '' }, finish_reason: 'stop', index: 0 }],
        usage
      },
      usage
    };
  }

  if (provider.type === 'anthropic') {
    const content = data.content as Array<{ type: string; text?: string }> | undefined;
    const text = content?.find((c) => c.type === 'text')?.text || '';
    const inputUsage = (data.usage as Record<string, number>) || {};
    const usage = {
      prompt_tokens: inputUsage.input_tokens || 0,
      completion_tokens: inputUsage.output_tokens || 0,
      total_tokens: (inputUsage.input_tokens || 0) + (inputUsage.output_tokens || 0)
    };
    return {
      body: {
        id: data.id || `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop', index: 0 }],
        usage
      },
      usage
    };
  }

  // OpenAI — pass through
  const usage = (data.usage || {}) as UsageResult;
  return { body: data, usage };
}

function transformEmbedResponse(
  data: Record<string, unknown>,
  provider: ResolvedProvider
): { body: Record<string, unknown>; usage: UsageResult } {
  if (provider.type === 'ollama') {
    const raw = (data.embeddings || data.embedding || []) as number[][];
    const embeddings: number[][] = Array.isArray(raw[0]) ? raw : [raw as unknown as number[]];
    const usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    return {
      body: {
        object: 'list',
        data: embeddings.map((emb, i) => ({ object: 'embedding', embedding: emb, index: i })),
        usage
      },
      usage
    };
  }

  const usage = (data.usage || {}) as UsageResult;
  return { body: data, usage };
}

// ─── Router ───────────────────────────────────────────────────────────────────

/**
 * Create an Express router that proxies OpenAI-compatible requests
 * to configured LLM provider(s) with multi-provider routing.
 *
 * Supports:
 *   - Multiple providers (OpenAI, Anthropic, Ollama) configured at startup
 *   - Model-based routing: "anthropic/claude-3.5-sonnet" → anthropic provider
 *   - Header-based routing: X-Provider: ollama → ollama provider
 *   - Known model prefix routing: claude-* → anthropic, gpt-* → openai
 *   - Fire-and-forget inference metering on all calls
 *   - /v1/usage reporting endpoint for external usage submission
 */
export const createRouter = (options: AgenticRouterOptions): Router => {
  const router = Router();
  const { pgPool } = options;

  // POST /v1/chat/completions — multi-provider LLM proxy
  router.post('/v1/chat/completions', async (req: any, res: any) => {
    const databaseId = req.get('X-Database-Id');
    const entityId = req.get('X-Entity-Id');
    const actorId = req.get('X-Actor-Id');
    const requestProvider = req.get('X-Provider');
    const startTime = process.hrtime.bigint();

    const provider = resolveProvider(options, req.body?.model, requestProvider);

    log.info('chat/completions', {
      databaseId,
      entityId,
      provider: provider.type,
      model: req.body?.model
    });

    try {
      const upstreamUrl = resolveUpstreamUrl(provider, '/v1/chat/completions');
      const body = transformChatRequest(provider, req.body || {});
      const headers = buildHeaders(provider);

      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const latencyMs = Number(process.hrtime.bigint() - startTime) / 1e6;

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => '');
        log.error('upstream error', { status: upstream.status, provider: provider.type, body: text });

        if (pgPool) {
          logInferenceUsage(pgPool, {
            databaseId, entityId, actorId,
            model: String(req.body?.model || body.model || ''),
            provider: provider.type,
            service: 'chat',
            operation: 'chat/completions',
            inputTokens: 0, outputTokens: 0, totalTokens: 0,
            latencyMs,
            status: 'error',
            errorType: `upstream_${upstream.status}`
          });
        }

        res.status(upstream.status).json({
          error: { message: `LLM provider error: ${upstream.status}`, upstream: text }
        });
        return;
      }

      const data = await upstream.json() as Record<string, unknown>;
      const { body: responseBody, usage } = transformChatResponse(data, provider);

      log.info('inference complete', {
        databaseId,
        provider: provider.type,
        model: req.body?.model,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens
      });

      if (pgPool) {
        logInferenceUsage(pgPool, {
          databaseId, entityId, actorId,
          model: String(req.body?.model || body.model || ''),
          provider: provider.type,
          service: 'chat',
          operation: 'chat/completions',
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          latencyMs,
          status: 'ok',
          rawUsage: usage
        });
      }

      res.json(responseBody);
    } catch (err: any) {
      const latencyMs = Number(process.hrtime.bigint() - startTime) / 1e6;
      log.error('chat/completions error', err);

      if (pgPool) {
        logInferenceUsage(pgPool, {
          databaseId, entityId, actorId,
          model: String(req.body?.model || ''),
          provider: provider.type,
          service: 'chat',
          operation: 'chat/completions',
          inputTokens: 0, outputTokens: 0, totalTokens: 0,
          latencyMs,
          status: 'error',
          errorType: err.message
        });
      }

      res.status(502).json({
        error: { message: 'Failed to reach LLM provider', details: err.message }
      });
    }
  });

  // POST /v1/embeddings — multi-provider embedding proxy
  router.post('/v1/embeddings', async (req: any, res: any) => {
    const databaseId = req.get('X-Database-Id');
    const entityId = req.get('X-Entity-Id');
    const actorId = req.get('X-Actor-Id');
    const requestProvider = req.get('X-Provider');
    const startTime = process.hrtime.bigint();

    const provider = resolveProvider(options, req.body?.model, requestProvider);

    log.info('embeddings', { databaseId, entityId, provider: provider.type, model: req.body?.model });

    try {
      const upstreamUrl = resolveUpstreamUrl(provider, '/v1/embeddings');
      const body = transformEmbedRequest(provider, req.body || {});
      const headers = buildHeaders(provider);

      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const latencyMs = Number(process.hrtime.bigint() - startTime) / 1e6;

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => '');
        log.error('upstream embed error', { status: upstream.status, provider: provider.type });

        if (pgPool) {
          logInferenceUsage(pgPool, {
            databaseId, entityId, actorId,
            model: String(req.body?.model || body.model || ''),
            provider: provider.type,
            service: 'embed',
            operation: 'embeddings',
            inputTokens: 0, outputTokens: 0, totalTokens: 0,
            latencyMs,
            status: 'error',
            errorType: `upstream_${upstream.status}`
          });
        }

        res.status(upstream.status).json({
          error: { message: `LLM provider error: ${upstream.status}`, upstream: text }
        });
        return;
      }

      const data = await upstream.json() as Record<string, unknown>;
      const { body: responseBody, usage } = transformEmbedResponse(data, provider);

      log.info('embed complete', { databaseId, entityId, provider: provider.type });

      if (pgPool) {
        logInferenceUsage(pgPool, {
          databaseId, entityId, actorId,
          model: String(req.body?.model || body.model || ''),
          provider: provider.type,
          service: 'embed',
          operation: 'embeddings',
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: 0,
          totalTokens: usage.total_tokens || 0,
          latencyMs,
          status: 'ok',
          rawUsage: usage
        });
      }

      res.json(responseBody);
    } catch (err: any) {
      const latencyMs = Number(process.hrtime.bigint() - startTime) / 1e6;
      log.error('embeddings error', err);

      if (pgPool) {
        logInferenceUsage(pgPool, {
          databaseId, entityId, actorId,
          model: String(req.body?.model || ''),
          provider: provider.type,
          service: 'embed',
          operation: 'embeddings',
          inputTokens: 0, outputTokens: 0, totalTokens: 0,
          latencyMs,
          status: 'error',
          errorType: err.message
        });
      }

      res.status(502).json({
        error: { message: 'Failed to reach LLM provider', details: err.message }
      });
    }
  });

  // POST /v1/usage — external usage reporting endpoint
  // Allows Python functions (LlamaParse, HuggingFace, etc.) to report inference
  // usage back for billing when they call local models directly.
  router.post('/v1/usage', (req: any, res: any) => {
    const databaseId = req.get('X-Database-Id');
    const entityId = req.get('X-Entity-Id');
    const actorId = req.get('X-Actor-Id');

    const {
      model,
      provider: reportedProvider,
      service,
      operation,
      input_tokens,
      output_tokens,
      total_tokens,
      latency_ms,
      status,
      error_type,
      raw_usage
    } = req.body || {};

    if (!model) {
      res.status(400).json({ error: { message: 'model is required' } });
      return;
    }

    if (pgPool) {
      logInferenceUsage(pgPool, {
        databaseId,
        entityId,
        actorId,
        model: String(model),
        provider: String(reportedProvider || 'unknown'),
        service: (service === 'embed' ? 'embed' : 'chat') as 'chat' | 'embed',
        operation: operation || 'external',
        inputTokens: Number(input_tokens) || 0,
        outputTokens: Number(output_tokens) || 0,
        totalTokens: Number(total_tokens) || 0,
        latencyMs: Number(latency_ms) || 0,
        status: status === 'error' ? 'error' : 'ok',
        errorType: error_type || undefined,
        rawUsage: raw_usage || undefined
      });
    }

    res.status(202).json({ accepted: true });
  });

  // GET /v1/providers — list configured providers
  router.get('/v1/providers', (_req: any, res: any) => {
    const providers = options.providers || [{
      type: options.providerType || 'openai',
      baseUrl: options.providerBaseUrl || 'http://localhost:11434'
    }];
    res.json({
      providers: providers.map((p) => ({
        type: p.type,
        defaultModel: p.defaultModel
      }))
    });
  });

  // GET /healthz — health check
  router.get('/healthz', (_req: any, res: any) => {
    const providers = options.providers || [{
      type: options.providerType || 'openai',
      baseUrl: options.providerBaseUrl || 'http://localhost:11434'
    }];
    res.json({
      status: 'ok',
      provider: providers[0]?.type || 'openai',
      providerUrl: providers[0]?.baseUrl || options.providerBaseUrl,
      providers: providers.map((p) => p.type)
    });
  });

  return router;
};
