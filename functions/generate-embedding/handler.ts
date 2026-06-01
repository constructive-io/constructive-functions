import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { buildEmbedderFromEnv } from 'graphile-llm';
import { TypedDocumentString } from '@constructive-io/graphql-query';
import { toCamelCase, toPascalCase } from 'inflekt';
import { GraphQLClient } from 'graphql-request';

type EmbedPayload = {
  id: string;
  table: string;
  schema: string;
  // New format
  source_fields?: string[];
  target_field?: string;
  // Legacy format from trigger (field = target_field)
  field?: string;
  // Optional
  source_field?: string;
  stale_field?: string;
};

type QueryResult = {
  [key: string]: { nodes: Array<Record<string, unknown>> } | null;
};

type UpdateResult = {
  [key: string]: {
    [key: string]: { id: string } | null;
  } | null;
};

type UpdateInput = {
  id: string;
  patch: Record<string, unknown>;
};

const DEFAULT_SOURCE_FIELD = 'extracted_text';

const buildSelectQuery = (tableName: string, sourceFields: string[]): TypedDocumentString<QueryResult, { id: string }> => {
  const pluralCamel = toCamelCase(tableName);
  const fieldsCamel = sourceFields.map(f => toCamelCase(f)).join('\n          ');

  const query = `
    query GetSourceFields($id: UUID!) {
      ${pluralCamel}(where: {id: {equalTo: $id}}, first: 1) {
        nodes {
          ${fieldsCamel}
        }
      }
    }
  `;

  return new TypedDocumentString<QueryResult, { id: string }>(query);
};

const buildUpdateMutation = (tableName: string): TypedDocumentString<UpdateResult, UpdateInput> => {
  const singularCamel = toCamelCase(tableName.replace(/s$/, ''));
  const singularPascal = toPascalCase(tableName.replace(/s$/, ''));
  const patchFieldName = `${singularCamel}Patch`;

  const query = `
    mutation UpdateEmbedding($id: UUID!, $patch: ${singularPascal}Patch!) {
      update${singularPascal}(input: {id: $id, ${patchFieldName}: $patch}) {
        ${singularCamel} {
          id
        }
      }
    }
  `;

  return new TypedDocumentString<UpdateResult, UpdateInput>(query);
};

const handler: FunctionHandler<EmbedPayload> = async (params, ctx) => {
  const { id, table, schema } = params;

  if (!id || !table || !schema) {
    throw new Error('Missing required fields: id, table, schema');
  }

  // Handle both formats: new (source_fields/target_field) and legacy (field)
  const targetField = params.target_field || params.field;
  if (!targetField) {
    throw new Error('Missing target_field or field');
  }

  // Derive source_fields: explicit > source_field > default
  let sourceFields: string[];
  if (params.source_fields && Array.isArray(params.source_fields) && params.source_fields.length > 0) {
    sourceFields = params.source_fields;
  } else if (params.source_field) {
    sourceFields = [params.source_field];
  } else {
    sourceFields = [DEFAULT_SOURCE_FIELD];
  }

  const databaseId = ctx.job.databaseId;
  if (!databaseId) {
    throw new Error('Missing databaseId in job context');
  }

  ctx.log.info('Starting embedding generation', {
    id,
    table: `${schema}.${table}`,
    sourceFields,
    targetField
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

  // Query source fields
  const selectQuery = buildSelectQuery(table, sourceFields);
  const result = await client.request(selectQuery.toString(), { id }, headers);

  const pluralCamel = toCamelCase(table);
  const connection = result[pluralCamel];
  const record = connection?.nodes?.[0];

  if (!record) {
    throw new Error(`Record not found: ${schema}.${table} id=${id}`);
  }

  // Collect text from source fields
  const textParts: string[] = [];
  for (const field of sourceFields) {
    const fieldCamel = toCamelCase(field);
    const value = record[fieldCamel];
    if (value != null && typeof value === 'string' && value.trim().length > 0) {
      textParts.push(value.trim());
    }
  }

  if (textParts.length === 0) {
    ctx.log.warn('No text to embed', { id });
    return { complete: true, embedded: false, reason: 'no_text' };
  }

  const text = textParts.join('\n\n');
  ctx.log.info('Text prepared for embedding', { id, textLength: text.length });

  // Generate embedding
  const embResult = await embedder(text);

  // Update record with embedding
  const updateMutation = buildUpdateMutation(table);
  const targetFieldCamel = toCamelCase(targetField);

  const patch: Record<string, unknown> = {
    [targetFieldCamel]: embResult.embedding,
  };

  // Add stale field if provided
  if (params.stale_field) {
    const staleFieldCamel = toCamelCase(params.stale_field);
    patch[staleFieldCamel] = false;
  }

  await client.request(updateMutation.toString(), { id, patch }, headers);

  ctx.log.info('Embedding generation complete', {
    id,
    promptTokens: embResult.promptTokens,
    embeddingDim: embResult.embedding.length
  });

  return {
    complete: true,
    embedded: true,
    promptTokens: embResult.promptTokens,
    embeddingDim: embResult.embedding.length
  };
};

export default handler;
