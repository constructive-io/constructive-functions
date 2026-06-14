import type {
  AgentContext,
  InferenceOptions,
  InferenceResult,
  EmbedResult
} from '@constructive-io/fn-types';

type AgentHeaders = {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
};

/**
 * Create an AgentContext that proxies LLM calls to the agentic server.
 *
 * When `agenticServerUrl` is provided, inference/embed calls are forwarded
 * as HTTP requests with identity headers (X-Database-Id, X-Entity-Id,
 * X-Actor-Id, X-Internal-Service) set from the job context. These headers
 * are unforgeable because they originate from fn-runtime (server-side),
 * never from client input.
 *
 * When `agenticServerUrl` is absent, methods throw with a clear message.
 */
export const createAgentContext = (
  agenticServerUrl: string | undefined,
  headers: AgentHeaders
): AgentContext => {
  const { databaseId, entityId, actorId } = headers;

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Internal-Service': 'fn-runtime'
    };
    if (databaseId) h['X-Database-Id'] = databaseId;
    if (entityId) h['X-Entity-Id'] = entityId;
    if (actorId) h['X-Actor-Id'] = actorId;
    return h;
  };

  const inference = async (options: InferenceOptions): Promise<InferenceResult> => {
    if (!agenticServerUrl) {
      throw new Error(
        'Agent context not available. Set AGENTIC_SERVER_URL environment variable to enable LLM inference.'
      );
    }

    const url = `${agenticServerUrl}/v1/chat/completions`;
    const body: Record<string, unknown> = {
      messages: options.messages
    };
    if (options.model !== undefined) body.model = options.model;
    if (options.temperature !== undefined) body.temperature = options.temperature;
    if (options.max_tokens !== undefined) body.max_tokens = options.max_tokens;
    if (options.stream !== undefined) body.stream = options.stream;

    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Agentic server error ${res.status}: ${text}`);
    }

    const data = await res.json() as {
      choices: Array<{
        message: { role: string; content: string };
        finish_reason: string;
      }>;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };

    const choice = data.choices?.[0];
    return {
      content: choice?.message?.content ?? '',
      finishReason: choice?.finish_reason ?? 'stop',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0
      }
    };
  };

  const embed = async (
    input: string | string[],
    model?: string
  ): Promise<EmbedResult> => {
    if (!agenticServerUrl) {
      throw new Error(
        'Agent context not available. Set AGENTIC_SERVER_URL environment variable to enable embeddings.'
      );
    }

    const url = `${agenticServerUrl}/v1/embeddings`;
    const body: Record<string, unknown> = { input };
    if (model !== undefined) body.model = model;

    const res = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Agentic server error ${res.status}: ${text}`);
    }

    const data = await res.json() as {
      data: Array<{ embedding: number[]; index: number }>;
      usage: { prompt_tokens: number; total_tokens: number };
    };

    return {
      embeddings: data.data.map((d) => d.embedding),
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0
      }
    };
  };

  return {
    inference,
    embed,
    get databaseId() { return databaseId; },
    get entityId() { return entityId; }
  };
};
