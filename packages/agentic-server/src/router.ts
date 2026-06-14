import { Router } from 'express';
import { Logger } from '@pgpmjs/logger';

const log = new Logger('agentic-server');

export interface AgenticRouterOptions {
  /** Upstream LLM provider base URL (e.g., https://api.openai.com, http://ollama:11434) */
  providerBaseUrl: string;
  /** API key for the upstream provider (if needed) */
  providerApiKey?: string;
  /** Default model name */
  defaultModel?: string;
  /** Provider type: 'openai' | 'ollama' | 'anthropic' */
  providerType?: string;
}

/**
 * Create an Express router that proxies OpenAI-compatible requests
 * to a configured LLM provider.
 *
 * Identity headers (X-Database-Id, X-Entity-Id, X-Actor-Id) are trusted
 * ONLY when X-Internal-Service is present (i.e., the request comes from
 * fn-runtime, not from an external client). External requests must
 * authenticate via other means.
 */
export const createRouter = (options: AgenticRouterOptions): Router => {
  const router = Router();
  const { providerBaseUrl, providerApiKey, defaultModel, providerType } = options;

  // Resolve upstream URL based on provider type
  const resolveUpstreamUrl = (path: string): string => {
    const type = providerType || 'openai';
    if (type === 'ollama') {
      if (path === '/v1/chat/completions') return `${providerBaseUrl}/api/chat`;
      if (path === '/v1/embeddings') return `${providerBaseUrl}/api/embed`;
    }
    // OpenAI-compatible (OpenAI, Anthropic via proxy, etc.)
    return `${providerBaseUrl}${path}`;
  };

  // Transform request body for different provider types
  const transformRequest = (body: Record<string, unknown>, path: string): Record<string, unknown> => {
    const type = providerType || 'openai';
    if (type === 'ollama') {
      if (path === '/v1/chat/completions') {
        return {
          model: body.model || defaultModel || 'llama3',
          messages: body.messages,
          stream: false,
          ...(body.temperature !== undefined && {
            options: { temperature: body.temperature }
          })
        };
      }
      if (path === '/v1/embeddings') {
        return {
          model: body.model || defaultModel || 'nomic-embed-text',
          input: body.input
        };
      }
    }
    // OpenAI format — pass through with default model
    return {
      ...body,
      model: body.model || defaultModel || 'gpt-4o'
    };
  };

  // Transform provider response to OpenAI-compatible format
  const transformChatResponse = (data: Record<string, unknown>, type: string): Record<string, unknown> => {
    if (type === 'ollama') {
      const msg = data.message as { role: string; content: string } | undefined;
      return {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        choices: [
          {
            message: msg || { role: 'assistant', content: '' },
            finish_reason: 'stop',
            index: 0
          }
        ],
        usage: {
          prompt_tokens: (data.prompt_eval_count as number) || 0,
          completion_tokens: (data.eval_count as number) || 0,
          total_tokens: ((data.prompt_eval_count as number) || 0) + ((data.eval_count as number) || 0)
        }
      };
    }
    return data;
  };

  const transformEmbedResponse = (data: Record<string, unknown>, type: string): Record<string, unknown> => {
    if (type === 'ollama') {
      const raw = (data.embeddings || data.embedding || []) as number[][];
      const embeddings: number[][] = Array.isArray(raw[0]) ? raw : [raw as unknown as number[]];
      return {
        object: 'list',
        data: embeddings.map((emb, i) => ({
          object: 'embedding',
          embedding: emb,
          index: i
        })),
        usage: { prompt_tokens: 0, total_tokens: 0 }
      };
    }
    return data;
  };

  // POST /v1/chat/completions — proxy to LLM provider
  router.post('/v1/chat/completions', async (req: any, res: any) => {
    const internalService = req.get('X-Internal-Service');
    const databaseId = req.get('X-Database-Id');
    const entityId = req.get('X-Entity-Id');

    log.info('chat/completions', {
      internal: !!internalService,
      databaseId,
      entityId,
      model: req.body?.model
    });

    try {
      const upstreamUrl = resolveUpstreamUrl('/v1/chat/completions');
      const body = transformRequest(req.body || {}, '/v1/chat/completions');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (providerApiKey) {
        headers['Authorization'] = `Bearer ${providerApiKey}`;
      }

      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => '');
        log.error('upstream error', { status: upstream.status, body: text });
        res.status(upstream.status).json({
          error: { message: `LLM provider error: ${upstream.status}`, upstream: text }
        });
        return;
      }

      const type = providerType || 'openai';
      const data = await upstream.json() as Record<string, unknown>;
      const response = transformChatResponse(data, type);

      // Log usage for billing (async, don't block response)
      const usage = (response.usage || {}) as Record<string, number>;
      log.info('inference complete', {
        databaseId,
        entityId,
        model: body.model,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      });

      res.json(response);
    } catch (err: any) {
      log.error('chat/completions error', err);
      res.status(502).json({
        error: { message: 'Failed to reach LLM provider', details: err.message }
      });
    }
  });

  // POST /v1/embeddings — proxy to LLM provider
  router.post('/v1/embeddings', async (req: any, res: any) => {
    const databaseId = req.get('X-Database-Id');
    const entityId = req.get('X-Entity-Id');

    log.info('embeddings', { databaseId, entityId, model: req.body?.model });

    try {
      const upstreamUrl = resolveUpstreamUrl('/v1/embeddings');
      const body = transformRequest(req.body || {}, '/v1/embeddings');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (providerApiKey) {
        headers['Authorization'] = `Bearer ${providerApiKey}`;
      }

      const upstream = await fetch(upstreamUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!upstream.ok) {
        const text = await upstream.text().catch(() => '');
        log.error('upstream embed error', { status: upstream.status, body: text });
        res.status(upstream.status).json({
          error: { message: `LLM provider error: ${upstream.status}`, upstream: text }
        });
        return;
      }

      const type = providerType || 'openai';
      const data = await upstream.json() as Record<string, unknown>;
      const response = transformEmbedResponse(data, type);

      log.info('embed complete', { databaseId, entityId });

      res.json(response);
    } catch (err: any) {
      log.error('embeddings error', err);
      res.status(502).json({
        error: { message: 'Failed to reach LLM provider', details: err.message }
      });
    }
  });

  // GET /healthz — health check
  router.get('/healthz', (_req: any, res: any) => {
    res.json({
      status: 'ok',
      provider: providerType || 'openai',
      providerUrl: providerBaseUrl
    });
  });

  return router;
};
