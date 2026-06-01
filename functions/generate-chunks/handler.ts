import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { buildEmbedderFromEnv } from 'graphile-llm';
import { TypedDocumentString } from '@constructive-io/graphql-query';
import { singularize, toCamelCase, toPascalCase } from 'inflekt';
import { GraphQLClient } from 'graphql-request';

type ChunkStrategy = 'fixed' | 'sentence' | 'paragraph';

type ChunkPayload = {
  id: string;
  table: string;
  schema: string;
  chunks_table?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  chunk_strategy?: ChunkStrategy;
  text_column?: string;
  parent_fk_column?: string;
};

type ChunkResult = {
  content: string;
  chunk_index: number;
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
      chunk_index: index
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
  let index = 0;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > targetSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        chunk_index: index
      });
      index++;

      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunk_index: index
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
  let index = 0;

  for (const para of paragraphs) {
    const paraWithSep = para + '\n\n';

    if (currentChunk.length + paraWithSep.length > targetSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        chunk_index: index
      });
      index++;

      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + paraWithSep;
    } else {
      currentChunk += paraWithSep;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      chunk_index: index
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

type QueryResult = {
  [key: string]: {
    extractedText: string | null;
    ownerId: string | null;
  } | null;
};

type CreateResult = {
  [key: string]: {
    [key: string]: { id: string } | null;
  } | null;
};

const buildSelectQuery = (tableName: string, textColumn: string): TypedDocumentString<QueryResult, { id: string }> => {
  const singularCamel = toCamelCase(singularize(tableName));
  const textFieldCamel = toCamelCase(textColumn);

  const query = `
    query GetSourceText($id: UUID!) {
      ${singularCamel}(id: $id) {
        ${textFieldCamel}
        ownerId
      }
    }
  `;

  return new TypedDocumentString<QueryResult, { id: string }>(query);
};

type CreateChunkInput = {
  input: {
    [key: string]: {
      content: string;
      chunkIndex: number;
      embedding: string;
      ownerId?: string;
      [parentFk: string]: unknown;
    };
  };
};

const buildCreateChunkMutation = (chunksTable: string, parentFkColumn: string): TypedDocumentString<CreateResult, CreateChunkInput> => {
  const singularCamel = toCamelCase(singularize(chunksTable));
  const singularPascal = toPascalCase(singularize(chunksTable));
  const inputFieldName = `${singularCamel}`;

  const query = `
    mutation CreateChunk($input: Create${singularPascal}Input!) {
      create${singularPascal}(input: $input) {
        ${singularCamel} {
          id
        }
      }
    }
  `;

  return new TypedDocumentString<CreateResult, CreateChunkInput>(query);
};

const handler: FunctionHandler<ChunkPayload> = async (params, ctx) => {
  const {
    id,
    table,
    schema,
    chunk_size = DEFAULT_CHUNK_SIZE,
    chunk_overlap = DEFAULT_CHUNK_OVERLAP,
    chunk_strategy = DEFAULT_STRATEGY,
    text_column = 'extracted_text'
  } = params;

  const chunks_table = params.chunks_table || singularize(table) + '_chunks';
  const parent_fk_column = params.parent_fk_column || singularize(table) + '_id';

  if (!id || !table || !schema) {
    throw new Error('Missing required fields: id, table, schema');
  }

  const databaseId = ctx.job.databaseId;
  if (!databaseId) {
    throw new Error('Missing databaseId in job context');
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

  const client = ctx.client as GraphQLClient;
  const headers = {
    'X-Database-Id': databaseId,
    'X-Schemata': schema,
  };

  const selectQuery = buildSelectQuery(table, text_column);
  const result = await client.request(selectQuery.toString(), { id }, headers);

  const singularCamel = toCamelCase(singularize(table));
  const record = result[singularCamel];

  if (!record) {
    throw new Error(`Record not found: ${schema}.${table} id=${id}`);
  }

  const textFieldCamel = toCamelCase(text_column);
  const text = (record as Record<string, unknown>)[textFieldCamel] as string | null;
  const ownerId = record.ownerId;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    ctx.log.warn('No text to chunk', { id });
    return { complete: true, chunks_created: 0 };
  }

  const chunks = splitText(text, chunk_strategy, chunk_size, chunk_overlap);
  ctx.log.info('Text split into chunks', { count: chunks.length });

  let totalPromptTokens = 0;
  const createMutation = buildCreateChunkMutation(chunks_table, parent_fk_column);
  const chunkSingularCamel = toCamelCase(singularize(chunks_table));
  const parentFkCamel = toCamelCase(parent_fk_column);

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const embeddings = await Promise.all(
      batch.map(async (chunk) => {
        const embResult = await embedder(chunk.content);
        totalPromptTokens += embResult.promptTokens;
        return embResult.embedding;
      })
    );

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const embedding = embeddings[j];
      const vectorStr = `[${embedding.join(',')}]`;

      const input: Record<string, unknown> = {
        [chunkSingularCamel]: {
          [parentFkCamel]: id,
          content: chunk.content,
          chunkIndex: chunk.chunk_index,
          embedding: vectorStr,
          ...(ownerId ? { ownerId } : {}),
        },
      };

      await client.request(createMutation.toString(), { input }, headers);
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
};

export default handler;
