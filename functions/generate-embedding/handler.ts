import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { buildEmbedderFromEnv } from 'graphile-llm';
import pg from 'pg';

type EmbedPayload = {
  id: string;
  table: string;
  schema: string;
  source_fields: string[];
  target_field: string;
  stale_field?: string;
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

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL ||
      `postgres://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'postgres'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'constructive'}`
  });

  await client.connect();

  try {
    const fieldList = source_fields.map(f => `"${f}"`).join(', ');
    const selectQuery = `SELECT ${fieldList} FROM "${schema}"."${table}" WHERE id = $1::uuid`;
    const selectResult = await client.query(selectQuery, [id]);

    if (selectResult.rows.length === 0) {
      throw new Error(`Record not found: ${schema}.${table} id=${id}`);
    }

    const row = selectResult.rows[0];
    const textParts: string[] = [];

    for (const field of source_fields) {
      const value = row[field];
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

    const result = await embedder(text);
    const vectorStr = `[${result.embedding.join(',')}]`;

    const updateQuery = `
      UPDATE "${schema}"."${table}"
      SET "${target_field}" = $1::vector,
          "${stale_field}" = false
      WHERE id = $2::uuid
    `;

    await client.query(updateQuery, [vectorStr, id]);

    ctx.log.info('Embedding generation complete', {
      id,
      prompt_tokens: result.promptTokens,
      embedding_dim: result.embedding.length
    });

    return {
      complete: true,
      embedded: true,
      prompt_tokens: result.promptTokens,
      embedding_dim: result.embedding.length
    };
  } finally {
    await client.end();
  }
};

export default handler;
