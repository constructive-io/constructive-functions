import type { FunctionHandler } from '@constructive-io/fn-runtime';
import OllamaClient from '@agentic-kit/ollama';
import {
  SCHEMA_INTROSPECTION_QUERY,
  inferTablesFromIntrospection,
  buildSelect,
  buildPostGraphileCreate,
  buildPostGraphileDelete,
  type IntrospectionQueryResponse,
} from '@constructive-io/graphql-query';

// Job payload from embedding_chunks trigger
type GenerateChunksParams = {
  table: string;
  schema: string;
  id: string;
  chunks_table: string;
  chunk_size: string;
  chunk_overlap: string;
  chunk_strategy: 'fixed' | 'sentence' | 'paragraph' | 'semantic';
};

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
    case 'semantic':
      // Fallback to fixed for now - semantic requires more sophisticated handling
      return chunkByFixed(text, chunkSize, chunkOverlap);
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

    // Prevent infinite loop
    if (chunkSize <= chunkOverlap) {
      break;
    }
  }

  return chunks;
}

function chunkBySentence(text: string, chunkSize: number, chunkOverlap: number): string[] {
  // Split by sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  let overlapBuffer: string[] = [];

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if ((currentChunk + ' ' + trimmedSentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      // Build overlap from recent sentences
      currentChunk = overlapBuffer.join(' ') + ' ' + trimmedSentence;
      overlapBuffer = [];
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + trimmedSentence : trimmedSentence;
    }

    // Track sentences for overlap
    overlapBuffer.push(trimmedSentence);
    const overlapLength = overlapBuffer.join(' ').length;
    while (overlapLength > chunkOverlap && overlapBuffer.length > 1) {
      overlapBuffer.shift();
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function chunkByParagraph(text: string, chunkSize: number, chunkOverlap: number): string[] {
  // Split by paragraph boundaries (double newlines)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    if ((currentChunk + '\n\n' + trimmedParagraph).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedParagraph;
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + trimmedParagraph : trimmedParagraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // If paragraphs are too large, fall back to fixed chunking
  return chunks.flatMap(chunk =>
    chunk.length > chunkSize * 1.5
      ? chunkByFixed(chunk, chunkSize, chunkOverlap)
      : [chunk]
  );
}

const handler: FunctionHandler<GenerateChunksParams> = async (params, context) => {
  const { job, log, env } = context;

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
    chunk_strategy
  } = params;

  // Validate required params
  // Note: `schema` should be the actual PostgreSQL schema name (e.g., "test-rag-beacb720-app-public")
  if (!table || !schema || !id || !chunks_table) {
    throw new Error(`Missing required params: table=${table}, schema=${schema}, id=${id}, chunks_table=${chunks_table}`);
  }

  log.info('[rag-embedding] Using schema from job payload', { databaseId, schema });

  // Custom headers for this schema
  const schemaHeaders = { 'X-Schemata': schema };

  const chunkSize = parseInt(chunk_size, 10) || 1000;
  const chunkOverlap = parseInt(chunk_overlap, 10) || 200;
  const strategy = chunk_strategy || 'fixed';

  log.info('[generate-chunks] Processing', {
    table,
    schema,
    id,
    chunks_table,
    chunkSize,
    chunkOverlap,
    strategy
  });

  // Initialize Ollama client
  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434';
  const embeddingModel = env.EMBEDDING_MODEL || 'nomic-embed-text:latest';
  const ollama = new OllamaClient(ollamaUrl);

  // Fetch schema introspection to get table metadata
  log.info('[rag-embedding] Fetching schema introspection');
  const introspectionResult = await context.request<IntrospectionQueryResponse>(SCHEMA_INTROSPECTION_QUERY, undefined, schemaHeaders);
  const tables = inferTablesFromIntrospection(introspectionResult);

  // Find tables by query field name (plural camelCase, e.g., "articles")
  // This is more reliable than matching by entity name which requires singularization
  const parentQueryName = table.replace(/_/g, '').toLowerCase();
  const chunksQueryName = chunks_table.replace(/_/g, '').toLowerCase();

  const parentTable = tables.find(t =>
    t.query?.all?.toLowerCase() === parentQueryName ||
    t.inflection?.allRows?.toLowerCase() === parentQueryName
  );
  const chunksTable = tables.find(t =>
    t.query?.all?.toLowerCase() === chunksQueryName ||
    t.inflection?.allRows?.toLowerCase() === chunksQueryName
  );

  if (!parentTable) {
    const availableTables = tables.map(t => `${t.name} (query: ${t.query?.all})`).join(', ');
    throw new Error(`Parent table not found for query name: ${parentQueryName}. Available: ${availableTables}`);
  }
  if (!chunksTable) {
    const availableTables = tables.map(t => `${t.name} (query: ${t.query?.all})`).join(', ');
    throw new Error(`Chunks table not found for query name: ${chunksQueryName}. Available: ${availableTables}`);
  }

  // Get field names from table metadata
  const parentFieldNamePlural = parentTable.query?.all || parentTable.inflection?.allRows;
  const chunksFieldNamePlural = chunksTable.query?.all || chunksTable.inflection?.allRows;
  // For CREATE mutations, use tableFieldName (e.g., "articlesChunk"), not patchFieldName
  const chunkFieldName = chunksTable.inflection?.tableFieldName || chunksTable.query?.patchFieldName;
  const createMutationName = chunksTable.query?.create || chunksTable.inflection?.createField;

  // FK field - find the belongsTo relation that references the parent table
  const parentRelation = chunksTable.relations.belongsTo.find(r => r.referencesTable === parentTable.name);
  const parentFkFieldName = parentRelation?.fieldName ? parentRelation.fieldName + 'Id' : `${parentTable.inflection?.tableFieldName || parentTable.name.charAt(0).toLowerCase() + parentTable.name.slice(1)}Id`;

  // 1. Fetch content from parent table using buildSelect
  const getContentQuery = buildSelect(parentTable, tables, {
    where: {},
    fieldSelection: { select: ['id', 'content'] }
  });

  const contentResult = await context.request<{
    [key: string]: { nodes: Array<{ id: string; content: string }> } | null
  }>(getContentQuery.toString(), { where: { id: { equalTo: id } } }, schemaHeaders);

  const nodes = contentResult[parentFieldNamePlural!]?.nodes;
  const record = nodes && nodes.length > 0 ? nodes[0] : null;
  if (!record) {
    throw new Error(`Record not found: ${schema}.${table} id=${id}`);
  }

  const content = record.content;
  if (!content || content.trim().length === 0) {
    log.info('[generate-chunks] No content to chunk', { id });
    return { complete: true, chunks: 0 };
  }

  // 2. Delete existing chunks (for re-chunking)
  try {
    // Query existing chunks using buildSelect
    const getChunksQuery = buildSelect(chunksTable, tables, {
      where: {},
      fieldSelection: { select: ['id'] }
    });
    const chunksResult = await context.request<{
      [key: string]: { nodes: Array<{ id: string }> } | null
    }>(getChunksQuery.toString(), { where: { [parentFkFieldName]: { equalTo: id } } }, schemaHeaders);

    const existingChunks = chunksResult[chunksFieldNamePlural!]?.nodes || [];

    // Delete each chunk by ID using buildPostGraphileDelete
    const deleteMutation = buildPostGraphileDelete(chunksTable, tables);
    for (const chunk of existingChunks) {
      await context.request(deleteMutation.toString(), { input: { id: chunk.id } }, schemaHeaders);
    }

    if (existingChunks.length > 0) {
      log.info('[generate-chunks] Deleted existing chunks', { count: existingChunks.length, parentId: id });
    }
  } catch (err) {
    // Ignore if no chunks exist or delete mutation doesn't exist
    log.info('[generate-chunks] No existing chunks to delete or delete not available', { error: String(err) });
  }

  // 3. Chunk the content
  const textChunks = chunkText(content, chunkSize, chunkOverlap, strategy);
  log.info('[generate-chunks] Created chunks', { count: textChunks.length });

  if (textChunks.length === 0) {
    return { complete: true, chunks: 0 };
  }

  // 4. Generate embeddings and insert chunks
  const insertedChunks: string[] = [];
  const insertMutation = buildPostGraphileCreate(chunksTable, tables);

  for (let i = 0; i < textChunks.length; i++) {
    const chunkContent = textChunks[i];

    // Generate embedding
    let embedding: number[];
    try {
      embedding = await ollama.generateEmbedding(chunkContent, embeddingModel);
    } catch (err) {
      log.error('[generate-chunks] Embedding failed', { chunk_index: i, error: String(err) });
      throw new Error(`Failed to generate embedding for chunk ${i}: ${err}`);
    }

    try {
      const result = await context.request<{
        [key: string]: { [key: string]: { id: string } }
      }>(insertMutation.toString(), {
        input: {
          [chunkFieldName!]: {
            [parentFkFieldName]: id,
            content: chunkContent,
            chunkIndex: i,
            embedding,
            metadata: {
              chunk_strategy: strategy,
              chunk_size: chunkSize,
              chunk_overlap: chunkOverlap,
              original_length: content.length
            }
          }
        }
      }, schemaHeaders);

      const insertedId = result[createMutationName!]?.[chunkFieldName!]?.id;
      if (insertedId) {
        insertedChunks.push(insertedId);
      }
    } catch (err) {
      log.error('[generate-chunks] Insert failed', { chunk_index: i, error: String(err) });
      throw new Error(`Failed to insert chunk ${i}: ${err}`);
    }

    log.info('[generate-chunks] Inserted chunk', {
      chunk_index: i,
      embedding_dims: embedding.length
    });
  }

  log.info('[generate-chunks] Complete', {
    id,
    chunks: insertedChunks.length,
    embedding_model: embeddingModel
  });

  return {
    complete: true,
    chunks: insertedChunks.length,
    chunk_ids: insertedChunks
  };
};

export default handler;
