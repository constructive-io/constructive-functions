import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { parseEnvBoolean } from '@pgpmjs/env';
import { createLogger } from '@pgpmjs/logger';
import { buildEmbedderFromEnv } from 'graphile-llm';
import { Client as PgClient } from 'pg';

type ProcessFileEmbeddingPayload = {
  file_id: string;
  key: string;
  mime_type: string;
  bucket_id: string;
  schema?: string;
  table?: string;
  extraction?: {
    task_identifier?: string;
    text_field?: string;
    metadata_field?: string;
    status_field?: string;
  };
};

const logger = createLogger('process-file-embedding');

const createPgClient = (): PgClient => {
  return new PgClient({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'password',
    database: process.env.PGDATABASE || 'constructive'
  });
};

const updateFileEmbedding = async (
  fileId: string,
  embedding: number[],
  tableName: string = 'app.files',
  embeddingColumn: string = 'embedding'
): Promise<void> => {
  const pg = createPgClient();
  try {
    await pg.connect();
    const vectorStr = `[${embedding.join(',')}]`;
    await pg.query(
      `UPDATE ${tableName} SET ${embeddingColumn} = $1::vector WHERE id = $2`,
      [vectorStr, fileId]
    );
  } finally {
    await pg.end();
  }
};

const enqueueJob = async (
  taskIdentifier: string,
  payload: Record<string, unknown>,
  databaseId?: string
): Promise<void> => {
  const pg = createPgClient();
  try {
    await pg.connect();
    if (databaseId) {
      await pg.query(`SELECT set_config('jwt.claims.database_id', $1, true)`, [
        databaseId
      ]);
    }
    await pg.query(`SELECT app_jobs.add_job($1::text, $2::json)`, [
      taskIdentifier,
      JSON.stringify(payload)
    ]);
  } finally {
    await pg.end();
  }
};

const createS3ClientFromEnv = (): S3Client => {
  const provider = process.env.BUCKET_PROVIDER || 'minio';
  const pathStyleProviders = new Set(['minio', 'r2', 'gcs']);

  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || process.env.CDN_ENDPOINT,
    forcePathStyle: pathStyleProviders.has(provider),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY || ''
    }
  });
};

const streamToString = async (
  stream: NodeJS.ReadableStream
): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
};

const isTextMimeType = (mimeType: string): boolean => {
  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml' ||
    mimeType === 'application/javascript'
  );
};

const getBucketKey = async (
  bucketId: string,
  schema: string
): Promise<string> => {
  const pg = createPgClient();
  try {
    await pg.connect();
    const result = await pg.query(
      `SELECT key FROM "${schema}".app_buckets WHERE id = $1`,
      [bucketId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Bucket not found: ${bucketId}`);
    }
    return result.rows[0].key;
  } finally {
    await pg.end();
  }
};

/**
 * Resolve bucket_id to full S3 bucket name.
 * S3 bucket name format: {prefix}-{bucketType}-{databaseId}
 * e.g., "test-bucket-public-019e9171-8c95-7e7f-99e5-aa4784b86f93"
 *
 * Always derive database_id from schema (more reliable than job context).
 */
const resolveS3BucketName = async (
  bucketId: string,
  schema: string
): Promise<string> => {
  const pg = createPgClient();
  try {
    await pg.connect();

    // Get bucket type from app_buckets (S3 bucket name uses type, not key)
    const bucketResult = await pg.query(
      `SELECT type FROM "${schema}".app_buckets WHERE id = $1`,
      [bucketId]
    );
    if (bucketResult.rows.length === 0) {
      throw new Error(`Bucket not found: ${bucketId}`);
    }
    const bucketType = bucketResult.rows[0].type;

    // Get database_id from schema (always reliable)
    const schemaResult = await pg.query(
      `SELECT database_id FROM metaschema_public.schema WHERE schema_name = $1`,
      [schema]
    );
    if (schemaResult.rows.length === 0) {
      throw new Error(`Schema not found in metaschema: ${schema}`);
    }
    const databaseId = schemaResult.rows[0].database_id;

    // Build S3 bucket name: {prefix}-{bucketType}-{databaseId}
    const prefix = process.env.CDN_BUCKET_NAME || process.env.BUCKET_NAME || 'test-bucket';
    return `${prefix}-${bucketType}-${databaseId}`;
  } finally {
    await pg.end();
  }
};

const downloadFile = async (
  s3: S3Client,
  bucket: string,
  key: string
): Promise<Buffer> => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error('Empty response body from S3');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const processDirectEmbedding = async (
  fileContent: Buffer,
  mimeType: string
): Promise<number[]> => {
  const embedder = buildEmbedderFromEnv();
  if (!embedder) {
    throw new Error(
      'No embedder configured. Set EMBEDDER_PROVIDER, EMBEDDER_MODEL, EMBEDDER_BASE_URL'
    );
  }

  if (!isTextMimeType(mimeType)) {
    throw new Error(
      `Direct embedding for ${mimeType} not yet supported. Use extraction mode for non-text files.`
    );
  }

  const text = fileContent.toString('utf-8');
  if (!text.trim()) {
    throw new Error('File content is empty');
  }

  const result = await embedder(text);
  logger.info('Generated embedding', {
    dimensions: result.embedding.length,
    promptTokens: result.promptTokens
  });

  return result.embedding;
};

const handler: FunctionHandler<ProcessFileEmbeddingPayload> = async (
  params,
  context
) => {
  const { client, job, log, env } = context;
  const isDryRun = parseEnvBoolean(env.PROCESS_FILE_EMBEDDING_DRY_RUN) ?? false;

  const { file_id, key, mime_type, bucket_id, schema, table, extraction } = params;

  if (!file_id || !key || !bucket_id) {
    throw new Error('Missing required fields: file_id, key, or bucket_id');
  }

  log.info('[process-file-embedding] Processing file', {
    file_id,
    key,
    mime_type,
    bucket_id,
    schema,
    table,
    hasExtraction: Boolean(extraction)
  });

  if (extraction) {
    const textField = extraction.text_field || 'extracted_text';
    const metadataField = extraction.metadata_field || 'extracted_metadata';

    log.info('[process-file-embedding] Extraction mode - extracting text', {
      text_field: textField,
      metadata_field: metadataField
    });

    if (isDryRun) {
      log.info('[process-file-embedding] DRY RUN - skipping extraction');
      return {
        complete: true,
        dryRun: true,
        mode: 'extraction'
      };
    }

    const s3 = createS3ClientFromEnv();

    // Resolve bucket_id to full S3 bucket name (derive database_id from schema)
    let bucketName = bucket_id;
    const storageSchema = schema || 'storage_public';
    try {
      bucketName = await resolveS3BucketName(bucket_id, storageSchema);
      log.info('[process-file-embedding] Resolved S3 bucket name', { bucket_id, bucketName, schema: storageSchema });
    } catch (err) {
      log.error('[process-file-embedding] Could not resolve bucket', { error: (err as Error).message });
    }

    const fileContent = await downloadFile(s3, bucketName, key);
    log.info('[process-file-embedding] Downloaded file for extraction', { size: fileContent.length });

    // Extract text (for now, just use the raw content for text files)
    let extractedText = '';
    const metadata: Record<string, unknown> = { mime_type, size: fileContent.length };

    if (isTextMimeType(mime_type)) {
      extractedText = fileContent.toString('utf-8');
    } else {
      // TODO: Add PDF extraction, etc.
      extractedText = `[Binary file: ${mime_type}, ${fileContent.length} bytes]`;
      metadata.binary = true;
    }

    // Update the database
    const targetSchema = schema || 'app';
    const targetTable = table || 'app_files';
    const fullTableName = `"${targetSchema}"."${targetTable}"`;

    const pg = createPgClient();
    try {
      await pg.connect();
      await pg.query(
        `UPDATE ${fullTableName} SET "${textField}" = $1, "${metadataField}" = $2 WHERE id = $3`,
        [extractedText, JSON.stringify(metadata), file_id]
      );
      log.info('[process-file-embedding] Updated extracted text', {
        file_id,
        textLength: extractedText.length,
        table: fullTableName
      });
    } finally {
      await pg.end();
    }

    return {
      complete: true,
      mode: 'extraction',
      textLength: extractedText.length
    };
  }

  const s3 = createS3ClientFromEnv();

  // Resolve bucket_id (UUID) to full S3 bucket name (derive database_id from schema)
  let bucketName = bucket_id;
  if (schema) {
    const storageSchema = schema.replace(/-app-public$/, '-storage-public');
    try {
      bucketName = await resolveS3BucketName(bucket_id, storageSchema);
      log.info('[process-file-embedding] Resolved S3 bucket name', { bucket_id, bucketName, schema: storageSchema });
    } catch (err) {
      log.info('[process-file-embedding] Could not resolve bucket, using bucket_id as name', {
        bucket_id,
        error: (err as Error).message
      });
    }
  }

  const fileContent = await downloadFile(s3, bucketName, key);

  log.info('[process-file-embedding] Downloaded file', {
    size: fileContent.length,
    mime_type
  });

  const embedding = await processDirectEmbedding(fileContent, mime_type);

  if (isDryRun) {
    log.info('[process-file-embedding] DRY RUN - skipping database update', {
      file_id,
      embeddingDimensions: embedding.length
    });
    return { complete: true, dryRun: true, dimensions: embedding.length };
  }

  // Use schema.table from payload if available, otherwise fall back to env
  const tableName = schema && table ? `"${schema}"."${table}"` : (env.EMBEDDING_TABLE || 'app.files');
  const embeddingColumn = env.EMBEDDING_COLUMN || 'embedding';
  await updateFileEmbedding(file_id, embedding, tableName, embeddingColumn);

  log.info('[process-file-embedding] Updated file embedding', {
    file_id,
    dimensions: embedding.length
  });

  return { complete: true, dimensions: embedding.length };
};

export default handler;
