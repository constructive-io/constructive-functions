import type { FunctionHandler } from './types';
import { chunkText, type ChunkStrategy } from '@constructive-io/text-chunker';
import { QuoteUtils } from '@pgsql/quotes';
import OllamaClient from '@agentic-kit/ollama';

type Params = {
  table: string;
  schema: string;
  id: string;
  chunks_table: string;
  chunk_size?: string;
  chunk_overlap?: string;
  chunk_strategy?: ChunkStrategy;
  content_field?: string;
  actor_id?: string;
};

type Result = {
  complete: boolean;
  chunks: number;
  chunk_ids?: string[];
};

const handler: FunctionHandler<Params, Result> = async (params, context) => {
  const { log, env, job, withUserContext } = context;

  const databaseId = job.databaseId;
  if (!databaseId) {
    throw new Error('Missing X-Database-Id header or DEFAULT_DATABASE_ID');
  }

  const {
    table,
    schema,
    id,
    chunks_table,
    chunk_size,
    chunk_overlap,
    chunk_strategy,
    content_field = 'content',
    actor_id,
  } = params;

  if (!table || !schema || !id || !chunks_table) {
    throw new Error(`Missing required params: table=${table}, schema=${schema}, id=${id}, chunks_table=${chunks_table}`);
  }

  const chunkSize = parseInt(chunk_size || '1000', 10);
  const chunkOverlap = parseInt(chunk_overlap || '200', 10);
  const strategy = chunk_strategy || 'fixed';

  // Validate chunk params
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new Error(`Invalid chunk_size: must be positive integer, got ${chunk_size}`);
  }
  if (!Number.isFinite(chunkOverlap) || chunkOverlap < 0) {
    throw new Error(`Invalid chunk_overlap: must be non-negative integer, got ${chunk_overlap}`);
  }
  if (chunkOverlap >= chunkSize) {
    throw new Error(`Invalid chunk_overlap: must be less than chunk_size (${chunkOverlap} >= ${chunkSize})`);
  }

  log.info('[rag-embedding] Processing', {
    table, schema, id, chunks_table, chunkSize, chunkOverlap, strategy, actor_id
  });

  // Properly quoted table names
  const parentTable = QuoteUtils.quoteDottedName([schema, table]);
  const chunksTable = QuoteUtils.quoteDottedName([schema, chunks_table]);
  const contentCol = QuoteUtils.quoteIdentifier(content_field);
  const parentFkCol = QuoteUtils.quoteIdentifier(`${table.replace(/_/g, '')}_id`);

  // Initialize embedding client
  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434';
  const embeddingModel = env.EMBEDDING_MODEL || 'nomic-embed-text:latest';
  const ollama = new OllamaClient(ollamaUrl);

  // === PHASE 1: Fetch content (short transaction) ===
  const content = await withUserContext(actor_id, async (client) => {
    const contentResult = await client.query(
      `SELECT ${contentCol} FROM ${parentTable} WHERE id = $1`,
      [id]
    );

    if (contentResult.rows.length === 0) {
      throw new Error(`Record not found: ${schema}.${table} id=${id}`);
    }

    return contentResult.rows[0][content_field] as string | null;
  });

  if (!content || content.trim().length === 0) {
    log.info('[rag-embedding] No content to chunk', { id });
    return { complete: true, chunks: 0 };
  }

  // === PHASE 2: Chunk text and generate embeddings (NO DB connection held) ===
  const textChunks = chunkText(content, { chunkSize, chunkOverlap, strategy });
  log.info('[rag-embedding] Created chunks', { count: textChunks.length });

  if (textChunks.length === 0) {
    return { complete: true, chunks: 0 };
  }

  // Generate all embeddings outside of transaction
  const embeddings: number[][] = [];
  for (let i = 0; i < textChunks.length; i++) {
    const embedding = await ollama.generateEmbedding(textChunks[i], embeddingModel);
    embeddings.push(embedding);
    log.info('[rag-embedding] Generated embedding', { chunk_index: i, dims: embedding.length });
  }

  // === PHASE 3: Delete old chunks and insert new ones (short transaction) ===
  const insertedIds = await withUserContext(actor_id, async (client) => {
    // Delete existing chunks
    await client.query(
      `DELETE FROM ${chunksTable} WHERE ${parentFkCol} = $1`,
      [id]
    );
    log.info('[rag-embedding] Deleted existing chunks', { id });

    // Insert new chunks
    const ids: string[] = [];
    for (let i = 0; i < textChunks.length; i++) {
      const insertResult = await client.query(
        `INSERT INTO ${chunksTable} (${parentFkCol}, content, chunk_index, embedding, metadata)
         VALUES ($1, $2, $3, $4::vector, $5)
         RETURNING id`,
        [
          id,
          textChunks[i],
          i,
          `[${embeddings[i].join(',')}]`,
          JSON.stringify({
            chunk_strategy: strategy,
            chunk_size: chunkSize,
            chunk_overlap: chunkOverlap,
            original_length: content.length,
          }),
        ]
      );
      ids.push(insertResult.rows[0].id);
    }

    return ids;
  });

  log.info('[rag-embedding] Complete', { id, chunks: insertedIds.length });
  return {
    complete: true,
    chunks: insertedIds.length,
    chunk_ids: insertedIds,
  };
};

export default handler;
