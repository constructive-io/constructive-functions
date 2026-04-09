import type { FunctionHandler } from './types';
import type { PoolClient } from 'pg';
import OllamaClient from '@agentic-kit/ollama';

// Job payload
type Params = {
  table: string;
  schema: string;
  id: string;
  chunks_table: string;
  chunk_size?: string;
  chunk_overlap?: string;
  chunk_strategy?: 'fixed' | 'sentence' | 'paragraph';
  actor_id?: string; // Optional: user ID for RLS context (from jwt_public.current_user_id())
};

type Result = {
  complete: boolean;
  chunks: number;
  chunk_ids?: string[];
};

// Helper: execute with actor context (RLS)
async function withUserContext<T>(
  pool: import('pg').Pool,
  actorId: string | undefined,
  databaseId: string | undefined,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Set actor context for RLS policies
    if (databaseId) {
      await client.query(`SELECT set_config('jwt.claims.database_id', $1, true)`, [databaseId]);
    }
    if (actorId) {
      await client.query(`SELECT set_config('jwt.claims.user_id', $1, true)`, [actorId]);
      await client.query('SET LOCAL ROLE authenticated');
    }

    const result = await fn(client);

    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Chunking strategies
function chunkText(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  strategy: string
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  switch (strategy) {
    case 'sentence':
      return chunkBySentence(text, chunkSize, chunkOverlap);
    case 'paragraph':
      return chunkByParagraph(text, chunkSize, chunkOverlap);
    case 'fixed':
    default:
      return chunkByFixed(text, chunkSize, chunkOverlap);
  }
}

function chunkByFixed(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap;
    if (chunkSize <= chunkOverlap) break;
  }

  return chunks;
}

function chunkBySentence(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  let overlapBuffer: string[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((currentChunk + ' ' + trimmed).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = overlapBuffer.join(' ') + ' ' + trimmed;
      overlapBuffer = [];
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmed : trimmed;
    }
    overlapBuffer.push(trimmed);
    while (overlapBuffer.join(' ').length > chunkOverlap && overlapBuffer.length > 1) {
      overlapBuffer.shift();
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

function chunkByParagraph(text: string, chunkSize: number, chunkOverlap: number): string[] {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if ((currentChunk + '\n\n' + trimmed).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.flatMap(chunk =>
    chunk.length > chunkSize * 1.5 ? chunkByFixed(chunk, chunkSize, chunkOverlap) : [chunk]
  );
}

const handler: FunctionHandler<Params, Result> = async (params, context) => {
  const { pool, log, env, job } = context;

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
    actor_id,
  } = params;

  if (!table || !schema || !id || !chunks_table) {
    throw new Error(`Missing required params: table=${table}, schema=${schema}, id=${id}, chunks_table=${chunks_table}`);
  }

  const chunkSize = parseInt(chunk_size || '1000', 10);
  const chunkOverlap = parseInt(chunk_overlap || '200', 10);
  const strategy = chunk_strategy || 'fixed';

  log.info('[rag-embedding-sql] Processing', {
    table, schema, id, chunks_table, chunkSize, chunkOverlap, strategy, actor_id
  });

  // Initialize Ollama client
  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434';
  const embeddingModel = env.EMBEDDING_MODEL || 'nomic-embed-text:latest';
  const ollama = new OllamaClient(ollamaUrl);

  // Execute with actor context (RLS enforced)
  const result = await withUserContext(pool, actor_id, databaseId, async (client) => {
    // Set search_path to the target schema (quoted for names with special chars)
    await client.query(`SET LOCAL search_path TO "${schema}", public`);

    // 1. Fetch content from parent table
    const contentResult = await client.query(
      `SELECT content FROM "${table}" WHERE id = $1`,
      [id]
    );

    if (contentResult.rows.length === 0) {
      throw new Error(`Record not found: ${schema}.${table} id=${id}`);
    }

    const content = contentResult.rows[0].content;
    if (!content || content.trim().length === 0) {
      log.info('[rag-embedding-sql] No content to chunk', { id });
      return { complete: true, chunks: 0 };
    }

    // 2. Delete existing chunks
    const parentFkColumn = `${table.replace(/_/g, '')}_id`; // e.g., articles -> articles_id
    await client.query(
      `DELETE FROM "${chunks_table}" WHERE "${parentFkColumn}" = $1`,
      [id]
    );
    log.info('[rag-embedding-sql] Deleted existing chunks', { id });

    // 3. Chunk the content
    const textChunks = chunkText(content, chunkSize, chunkOverlap, strategy);
    log.info('[rag-embedding-sql] Created chunks', { count: textChunks.length });

    if (textChunks.length === 0) {
      return { complete: true, chunks: 0 };
    }

    // 4. Generate embeddings and insert chunks
    const insertedIds: string[] = [];

    for (let i = 0; i < textChunks.length; i++) {
      const chunkContent = textChunks[i];

      // Generate embedding via Ollama
      let embedding: number[];
      try {
        embedding = await ollama.generateEmbedding(chunkContent, embeddingModel);
      } catch (err) {
        log.error('[rag-embedding-sql] Embedding failed', { chunk_index: i, error: String(err) });
        throw new Error(`Failed to generate embedding for chunk ${i}: ${err}`);
      }

      // Insert chunk with pgvector embedding
      const insertResult = await client.query(
        `INSERT INTO "${chunks_table}" ("${parentFkColumn}", content, chunk_index, embedding, metadata)
         VALUES ($1, $2, $3, $4::vector, $5)
         RETURNING id`,
        [
          id,
          chunkContent,
          i,
          `[${embedding.join(',')}]`,
          JSON.stringify({
            chunk_strategy: strategy,
            chunk_size: chunkSize,
            chunk_overlap: chunkOverlap,
            original_length: content.length,
          }),
        ]
      );

      insertedIds.push(insertResult.rows[0].id);
      log.info('[rag-embedding-sql] Inserted chunk', { chunk_index: i, embedding_dims: embedding.length });
    }

    return {
      complete: true,
      chunks: insertedIds.length,
      chunk_ids: insertedIds,
    };
  });

  log.info('[rag-embedding-sql] Complete', { id, chunks: result.chunks });
  return result;
};

export default handler;
