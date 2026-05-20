import type { FunctionHandler } from '@constructive-io/fn-runtime';
import OllamaClient from '@agentic-kit/ollama';
import {
  SCHEMA_INTROSPECTION_QUERY,
  inferTablesFromIntrospection,
  buildSelect,
  buildPostGraphileUpdate,
  type IntrospectionQueryResponse,
} from '@constructive-io/graphql-query';

// Job payload from SearchVector/SearchUnified embedding trigger
type GenerateEmbeddingParams = {
  table: string;
  schema: string;
  id: string;
  field: string; // embedding field name to write to (e.g., 'embedding')
  embedding_model?: string;
  embedding_provider?: string;
};

const handler: FunctionHandler<GenerateEmbeddingParams> = async (params, context) => {
  const { job, log, env, client } = context;

  const databaseId = job.databaseId;
  if (!databaseId) {
    throw new Error('Missing X-Database-Id header or DEFAULT_DATABASE_ID');
  }

  const { table, schema, id, field, embedding_model } = params;

  if (!table || !schema || !id || !field) {
    throw new Error(`Missing required params: table=${table}, schema=${schema}, id=${id}, field=${field}`);
  }

  log.info('[text-embedding] Processing generate_embedding job', {
    databaseId,
    table,
    schema,
    id,
    field,
  });

  const schemaHeaders = { 'X-Schemata': schema };

  // Initialize Ollama client
  const isDryRun = env.TEXT_EMBEDDING_DRY_RUN === 'true';
  const ollamaUrl = env.OLLAMA_URL || 'http://localhost:11434';
  const embeddingModel = embedding_model || env.EMBEDDING_MODEL || 'nomic-embed-text:latest';
  const ollama = isDryRun ? null : new OllamaClient(ollamaUrl);

  // Fetch schema introspection
  const introspectionResult = await client.request<IntrospectionQueryResponse>(
    SCHEMA_INTROSPECTION_QUERY,
    undefined,
    schemaHeaders
  );
  const tables = inferTablesFromIntrospection(introspectionResult);

  // Find the target table
  const queryName = table.replace(/_/g, '').toLowerCase();
  const targetTable = tables.find(
    (t) =>
      t.query?.all?.toLowerCase() === queryName ||
      t.inflection?.allRows?.toLowerCase() === queryName ||
      t.name?.toLowerCase() === queryName ||
      t.name?.toLowerCase() === table.toLowerCase()
  );

  if (!targetTable) {
    const availableTables = tables.map((t) => `${t.name} (query: ${t.query?.all})`).join(', ');
    throw new Error(`Table not found: ${queryName}. Available: ${availableTables}`);
  }

  const fieldNamePlural = targetTable.query?.all || targetTable.inflection?.allRows;
  const patchFieldName = targetTable.query?.patchFieldName || targetTable.inflection?.patchField;

  // Read embedding_text field (auto-maintained by SearchUnified's DataCompositeField trigger)
  const getContentQuery = buildSelect(targetTable, tables, {
    where: {},
    fieldSelection: { select: ['id', 'embeddingText'] },
  });

  const contentResult = await client.request<{
    [key: string]: { nodes: Array<{ id: string; embeddingText: string | null }> } | null;
  }>(getContentQuery.toString(), { where: { id: { equalTo: id } } }, schemaHeaders);

  const nodes = contentResult[fieldNamePlural!]?.nodes;
  const record = nodes && nodes.length > 0 ? nodes[0] : null;

  if (!record) {
    throw new Error(`Record not found: ${schema}.${table} id=${id}`);
  }

  const textContent = record.embeddingText;

  if (!textContent || textContent.trim().length === 0) {
    log.info('[text-embedding] No embedding_text content, skipping', { id });
    return { complete: true, skipped: true, reason: 'no_embedding_text' };
  }

  log.info('[text-embedding] Generating embedding', {
    textLength: textContent.length,
    model: embeddingModel,
  });

  // Generate embedding
  let embedding: number[];
  if (isDryRun) {
    embedding = Array(768).fill(0);
    log.info('[text-embedding] DRY_RUN: mock embedding');
  } else {
    embedding = await ollama!.generateEmbedding(textContent, embeddingModel);
  }

  // Convert field name from snake_case to camelCase for GraphQL
  const camelCaseField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  // Update the row with the embedding
  const updateMutation = buildPostGraphileUpdate(targetTable, tables);

  await client.request(
    updateMutation.toString(),
    {
      input: {
        id,
        [patchFieldName!]: {
          [camelCaseField]: embedding,
        },
      },
    },
    schemaHeaders
  );

  log.info('[text-embedding] Complete', {
    id,
    field,
    embedding_dims: embedding.length,
    model: embeddingModel,
  });

  return {
    complete: true,
    embedding_dims: embedding.length,
    model: embeddingModel,
  };
};

export default handler;
