import type { FunctionHandler } from '@constructive-io/fn-runtime';
import OllamaClient from '@agentic-kit/ollama';

interface Params {
  text: string;
  model?: string;
}

interface Result {
  embedding: number[];
  dimensions: number;
  model: string;
}

const handler: FunctionHandler<Params, Result> = async (params, context) => {
  const { log, env } = context;

  const { text, model } = params;

  if (!text || typeof text !== 'string') {
    throw new Error('Missing required param: text');
  }

  // DRY_RUN mode for CI testing - skip actual Ollama call
  if (env.TEXT_EMBEDDING_DRY_RUN === 'true') {
    log.info('[text-embedding] DRY_RUN mode, returning mock embedding');
    return {
      embedding: Array(768).fill(0),
      dimensions: 768,
      model: 'dry-run',
    };
  }

  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434';
  const embeddingModel = model || env.EMBEDDING_MODEL || 'nomic-embed-text:latest';

  log.info('[text-embedding] Generating embedding', {
    textLength: text.length,
    model: embeddingModel,
  });

  const ollama = new OllamaClient(ollamaUrl);
  const embedding = await ollama.generateEmbedding(text, embeddingModel);

  log.info('[text-embedding] Complete', {
    dimensions: embedding.length,
  });

  return {
    embedding,
    dimensions: embedding.length,
    model: embeddingModel,
  };
};

export default handler;
