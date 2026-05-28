import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { buildEmbedderFromEnv } from 'graphile-llm';
import pg from 'pg';

type ChunkStrategy = 'fixed' | 'sentence' | 'paragraph';

type ChunkPayload = {
  id: string;
  table: string;
  schema: string;
  chunks_table: string;
  chunk_size?: number;
  chunk_overlap?: number;
  chunk_strategy?: ChunkStrategy;
  text_column?: string;
  parent_fk_column?: string;
};

type ChunkResult = {
  content: string;
  chunk_index: number;
  metadata: {
    start_offset: number;
    end_offset: number;
    strategy: ChunkStrategy;
  };
};

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;
const DEFAULT_STRATEGY: ChunkStrategy = 'paragraph';
const BATCH_SIZE = 10;

function splitFixed(text: string, size: number, overlap: number): ChunkResult[] {
  const chunks: ChunkResult[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push({
      content: text.slice(start, end),
      chunk_index: index,
      metadata: {
        start_offset: start,
        end_offset: end,
        strategy: 'fixed'
      }
    });
    start += size - overlap;
    index++;
    if (start >= text.length) break;
  }

  return chunks;
}

function splitSentence(text: string, targetSize: number, overlap: number): ChunkResult[] {
  const sentenceRegex = /[^.!?]*[.!?]+\s*/g;
  const sentences: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = sentenceRegex.exec(text)) !== null) {
    sentences.push(match[0]);
  }

  const remainder = text.slice(sentenceRegex.lastIndex);
  if (remainder.trim()) {
    sentences.push(remainder);
  }

  if (sentences.length === 0) {
    return splitFixed(text, targetSize, overlap);
  }

  const chunks: ChunkResult[] = [];
  let currentChunk = '';
  let currentStart = 0;
  let offset = 0;
  let index = 0;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > targetSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        chunk_index: index,
        metadata: {
          start_offset: currentStart,
          end_offset: offset,
          strategy: 'sentence'
        }
      });
      index++;

      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + sentence;
      currentStart = offset - overlapText.length;
    } else {
      if (currentChunk.length === 0) {
        currentStart = offset;
      }
      currentChunk += sentence;
    }
    offset += sentence.length;
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunk_index: index,
      metadata: {
        start_offset: currentStart,
        end_offset: offset,
        strategy: 'sentence'
      }
    });
  }

  return chunks;
}

function splitParagraph(text: string, targetSize: number, overlap: number): ChunkResult[] {
  const paragraphs = text.split(/\n\s*\n/);

  if (paragraphs.length <= 1) {
    return splitSentence(text, targetSize, overlap);
  }

  const chunks: ChunkResult[] = [];
  let currentChunk = '';
  let currentStart = 0;
  let offset = 0;
  let index = 0;

  for (const para of paragraphs) {
    const paraWithSep = para + '\n\n';

    if (currentChunk.length + paraWithSep.length > targetSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        chunk_index: index,
        metadata: {
          start_offset: currentStart,
          end_offset: offset,
          strategy: 'paragraph'
        }
      });
      index++;

      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + paraWithSep;
      currentStart = offset - overlapText.length;
    } else {
      if (currentChunk.length === 0) {
        currentStart = offset;
      }
      currentChunk += paraWithSep;
    }
    offset += paraWithSep.length;
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunk_index: index,
      metadata: {
        start_offset: currentStart,
        end_offset: offset,
        strategy: 'paragraph'
      }
    });
  }

  return chunks;
}

function splitText(
  text: string,
  strategy: ChunkStrategy,
  size: number,
  overlap: number
): ChunkResult[] {
  switch (strategy) {
  case 'fixed':
    return splitFixed(text, size, overlap);
  case 'sentence':
    return splitSentence(text, size, overlap);
  case 'paragraph':
    return splitParagraph(text, size, overlap);
  default:
    return splitParagraph(text, size, overlap);
  }
}

const handler: FunctionHandler<ChunkPayload> = async (params, ctx) => {
  const {
    id,
    table,
    schema,
    chunks_table,
    chunk_size = DEFAULT_CHUNK_SIZE,
    chunk_overlap = DEFAULT_CHUNK_OVERLAP,
    chunk_strategy = DEFAULT_STRATEGY,
    text_column = 'extracted_text',
    parent_fk_column = 'parent_id'
  } = params;

  if (!id || !table || !schema || !chunks_table) {
    throw new Error('Missing required fields: id, table, schema, chunks_table');
  }

  ctx.log.info('Starting chunk generation', {
    id,
    table: `${schema}.${table}`,
    chunks_table,
    chunk_size,
    chunk_overlap,
    chunk_strategy
  });

  const embedder = buildEmbedderFromEnv();
  if (!embedder) {
    throw new Error('Failed to initialize embedder from environment');
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL ||
      `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'postgres'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'constructive'}`
  });

  await client.connect();

  try {
    const selectQuery = `SELECT "${text_column}" FROM "${schema}"."${table}" WHERE id = $1::uuid`;
    const selectResult = await client.query(selectQuery, [id]);

    if (selectResult.rows.length === 0) {
      throw new Error(`Record not found: ${schema}.${table} id=${id}`);
    }

    const text = selectResult.rows[0][text_column];
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      ctx.log.warn('No text to chunk', { id });
      return { complete: true, chunks_created: 0 };
    }

    const chunks = splitText(text, chunk_strategy, chunk_size, chunk_overlap);
    ctx.log.info('Text split into chunks', { count: chunks.length });

    let totalPromptTokens = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const embeddings = await Promise.all(
        batch.map(async (chunk) => {
          const result = await embedder(chunk.content);
          totalPromptTokens += result.promptTokens;
          return result.embedding;
        })
      );

      const insertQuery = `
        INSERT INTO "${schema}"."${chunks_table}"
        ("${parent_fk_column}", content, chunk_index, embedding, metadata)
        VALUES ($1::uuid, $2, $3, $4::vector, $5::jsonb)
      `;

      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = embeddings[j];
        const vectorStr = `[${embedding.join(',')}]`;

        await client.query(insertQuery, [
          id,
          chunk.content,
          chunk.chunk_index,
          vectorStr,
          JSON.stringify(chunk.metadata)
        ]);
      }

      ctx.log.info('Batch inserted', {
        batch: Math.floor(i / BATCH_SIZE) + 1,
        chunks: batch.length
      });
    }

    ctx.log.info('Chunk generation complete', {
      id,
      chunks_created: chunks.length,
      total_prompt_tokens: totalPromptTokens
    });

    return {
      complete: true,
      chunks_created: chunks.length,
      total_prompt_tokens: totalPromptTokens
    };
  } finally {
    await client.end();
  }
};

export default handler;
