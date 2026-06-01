import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { buildEmbedderFromEnv } from 'graphile-llm';
import { TypedDocumentString } from '@constructive-io/graphql-query';
import { singularize, toCamelCase, toPascalCase } from 'inflekt';
import { GraphQLClient } from 'graphql-request';

type EmbedPayload = {
  id: string;
  table: string;
  schema: string;
  source_fields: string[];
  target_field: string;
  stale_field?: string;
};

type QueryResult = {
  [key: string]: Record<string, unknown> | null;
};

type UpdateResult = {
  [key: string]: {
    [key: string]: { id: string } | null;
  } | null;
};

type UpdateVariables = {
  input: {
    id: string;
    [patchField: string]: unknown;
  };
};

const buildSelectQuery = (tableName: string, sourceFields: string[]): TypedDocumentString<QueryResult, { id: string }> => {
  const singularCamel = toCamelCase(singularize(tableName));
  const fieldsCamel = sourceFields.map(f => toCamelCase(f)).join('\n        ');

  const query = `
    query GetSourceFields($id: UUID!) {
      ${singularCamel}(id: $id) {
        ${fieldsCamel}
      }
    }
  `;

  return new TypedDocumentString<QueryResult, { id: string }>(query);
};

const buildUpdateMutation = (tableName: string): TypedDocumentString<UpdateResult, UpdateVariables> => {
  const singularCamel = toCamelCase(singularize(tableName));
  const singularPascal = toPascalCase(singularize(tableName));

  const query = `
    mutation UpdateEmbedding($input: Update${singularPascal}Input!) {
      update${singularPascal}(input: $input) {
        ${singularCamel} {
          id
        }
      }
    }
  `;

  return new TypedDocumentString<UpdateResult, UpdateVariables>(query);
};

const handler: FunctionHandler<EmbedPayload> = async (params, ctx) => {
  const {
    id,
    table,
    schema,
    source_fields,
    target_field,
    stale_field = 'embedding_stale'
  } = params;

  if (!id || !table || !schema || !source_fields || !target_field) {
    throw new Error('Missing required fields: id, table, schema, source_fields, target_field');
  }

  if (!Array.isArray(source_fields) || source_fields.length === 0) {
    throw new Error('source_fields must be a non-empty array');
  }

  const databaseId = ctx.job.databaseId;
  if (!databaseId) {
    throw new Error('Missing databaseId in job context');
  }

  ctx.log.info('Starting embedding generation', {
    id,
    table: `${schema}.${table}`,
    source_fields,
    target_field
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

  const selectQuery = buildSelectQuery(table, source_fields);
  const result = await client.request(selectQuery.toString(), { id }, headers);

  const singularCamel = toCamelCase(singularize(table));
  const record = result[singularCamel];

  if (!record) {
    throw new Error(`Record not found: ${schema}.${table} id=${id}`);
  }

  const textParts: string[] = [];

  for (const field of source_fields) {
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
  ctx.log.info('Text prepared for embedding', { id, text_length: text.length });

  const embResult = await embedder(text);
  const vectorStr = `[${embResult.embedding.join(',')}]`;

  const updateMutation = buildUpdateMutation(table);
  const patchFieldName = `${singularCamel}Patch`;
  const targetFieldCamel = toCamelCase(target_field);
  const staleFieldCamel = toCamelCase(stale_field);

  await client.request(updateMutation.toString(), {
    input: {
      id,
      [patchFieldName]: {
        [targetFieldCamel]: vectorStr,
        [staleFieldCamel]: false,
      },
    },
  }, headers);

  ctx.log.info('Embedding generation complete', {
    id,
    prompt_tokens: embResult.promptTokens,
    embedding_dim: embResult.embedding.length
  });

  return {
    complete: true,
    embedded: true,
    prompt_tokens: embResult.promptTokens,
    embedding_dim: embResult.embedding.length
  };
};

export default handler;
