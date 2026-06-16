import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { QuoteUtils } from '@pgsql/quotes';
import type { FunctionHandler } from './types';

type StorageConfirmUploadPayload = {
  file_id: string;
  key: string;
  bucket_id: string;
  mime_type?: string;
  actor_id?: string;
};

type Result = {
  success: boolean;
  file_id: string;
  bucket: string;
  key: string;
};

type StorageModuleConfig = {
  id: string;
  bucketsSchema: string;
  bucketsTable: string;
  filesSchema: string;
  filesTable: string;
  endpoint: string | null;
  provider: string | null;
};

const STORAGE_MODULE_QUERY = `
  SELECT
    sm.id,
    bs.schema_name AS buckets_schema,
    bt.name AS buckets_table,
    fs.schema_name AS files_schema,
    ft.name AS files_table,
    sm.endpoint,
    sm.provider
  FROM metaschema_modules_public.storage_module sm
  JOIN metaschema_public.table bt ON bt.id = sm.buckets_table_id
  JOIN metaschema_public.schema bs ON bs.id = bt.schema_id
  JOIN metaschema_public.table ft ON ft.id = sm.files_table_id
  JOIN metaschema_public.schema fs ON fs.id = ft.schema_id
  WHERE sm.database_id = $1
    AND sm.scope = 'app'
  LIMIT 1
`;

const getS3Client = (config?: StorageModuleConfig): S3Client => {
  const endpoint = config?.endpoint || process.env.CDN_ENDPOINT;
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const checkFileExistsInS3 = async (
  s3: S3Client,
  bucket: string,
  key: string
): Promise<boolean> => {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err: unknown) {
    const error = err as { name?: string };
    if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
      return false;
    }
    throw err;
  }
};

const handler: FunctionHandler<StorageConfirmUploadPayload, Result> = async (
  params,
  context
) => {
  const { job, log, pool } = context;
  const { file_id, key, bucket_id } = params;

  if (!file_id || !key || !bucket_id) {
    throw new Error('Missing required fields: file_id, key, or bucket_id');
  }

  if (!job.databaseId) {
    throw new Error('Missing databaseId in job context');
  }

  log.info('[storage-confirm-upload] Processing', { file_id, key, bucket_id });

  // Load storage module config from metaschema
  const client = await pool.connect();
  let config: StorageModuleConfig;
  try {
    const result = await client.query(STORAGE_MODULE_QUERY, [job.databaseId]);
    if (result.rows.length === 0) {
      throw new Error(`STORAGE_MODULE_NOT_FOUND for database ${job.databaseId}`);
    }
    const row = result.rows[0];
    config = {
      id: row.id,
      bucketsSchema: row.buckets_schema,
      bucketsTable: row.buckets_table,
      filesSchema: row.files_schema,
      filesTable: row.files_table,
      endpoint: row.endpoint,
      provider: row.provider,
    };
    log.info('[storage-confirm-upload] Loaded storage config', {
      bucketsSchema: config.bucketsSchema,
      filesSchema: config.filesSchema,
    });
  } finally {
    client.release();
  }

  // Resolve S3 bucket name from buckets table
  const bucketsQualifiedName = QuoteUtils.quoteQualifiedIdentifier(config.bucketsSchema, config.bucketsTable);
  let bucketName = bucket_id;
  const bucketClient = await pool.connect();
  try {
    const result = await bucketClient.query(
      `SELECT type FROM ${bucketsQualifiedName} WHERE id = $1`,
      [bucket_id]
    );
    if (result.rows.length > 0 && result.rows[0].type) {
      const bucketType = result.rows[0].type;
      bucketName = `test-bucket-${bucketType}-${job.databaseId}`;
      log.info('[storage-confirm-upload] Resolved bucket name', { bucket_id, bucketName });
    }
  } catch (err) {
    log.warn('[storage-confirm-upload] Could not resolve bucket, using bucket_id', {
      bucket_id,
      error: (err as Error).message,
    });
  } finally {
    bucketClient.release();
  }

  // Check file exists in S3
  const s3 = getS3Client(config);
  const exists = await checkFileExistsInS3(s3, bucketName, key);

  if (!exists) {
    log.info('[storage-confirm-upload] File not found in S3, will retry', {
      bucket: bucketName,
      key,
    });
    throw new Error(`File not found in S3: ${bucketName}/${key}`);
  }

  log.info('[storage-confirm-upload] File exists in S3', { bucket: bucketName, key });

  // Confirm file uploaded - private schema is derived from files schema
  const privateSchema = config.filesSchema.replace(/-public$/, '-private');
  const fnName = `${config.filesTable}_confirm_uploaded`;
  const fnQualifiedName = QuoteUtils.quoteQualifiedIdentifier(privateSchema, fnName);

  const confirmClient = await pool.connect();
  try {
    await confirmClient.query(`SELECT ${fnQualifiedName}($1)`, [file_id]);
    log.info('[storage-confirm-upload] File status confirmed', {
      file_id,
      schema: privateSchema,
      function: fnName,
    });
  } finally {
    confirmClient.release();
  }

  return {
    success: true,
    file_id,
    bucket: bucketName,
    key,
  };
};

export default handler;
