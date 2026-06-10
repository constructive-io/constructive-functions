import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { FunctionHandler } from '@constructive-io/fn-runtime';
import { createLogger } from '@pgpmjs/logger';
import { Client as PgClient } from 'pg';

type StorageConfirmUploadPayload = {
  file_id: string;
  key: string;
  bucket_id: string;
  mime_type: string;
  schema?: string;
  table?: string;
};

const logger = createLogger('storage-confirm-upload');

const createPgClient = (): PgClient => {
  return new PgClient({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'password',
    database: process.env.PGDATABASE || 'constructive',
  });
};

const createS3Client = (): S3Client => {
  const endpoint = process.env.S3_ENDPOINT || process.env.CDN_ENDPOINT;
  return new S3Client({
    region: process.env.CDN_REGION || process.env.AWS_REGION || 'us-east-1',
    endpoint: endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.CDN_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.CDN_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
};

const resolveS3BucketName = async (
  bucketId: string,
  storageSchema: string,
  databaseId: string
): Promise<string> => {
  const pg = createPgClient();
  try {
    await pg.connect();
    // Get bucket type to construct S3 bucket name
    // Format: test-bucket-{type}-{database_id}
    const result = await pg.query(
      `SELECT b.type
       FROM "${storageSchema}".app_buckets b
       WHERE b.id = $1`,
      [bucketId]
    );
    if (result.rows.length > 0 && result.rows[0].type) {
      const bucketType = result.rows[0].type;
      return `test-bucket-${bucketType}-${databaseId}`;
    }
    // Fallback to bucket_id if type not found
    return bucketId;
  } finally {
    await pg.end();
  }
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

const confirmFileUploaded = async (
  fileId: string,
  schema: string,
  table: string
): Promise<void> => {
  const pg = createPgClient();
  try {
    await pg.connect();
    const privateSchema = schema.replace(/-public$/, '-private');
    const fnName = `${table}_confirm_uploaded`;

    await pg.query(`SELECT "${privateSchema}"."${fnName}"($1)`, [fileId]);

    logger.info('[storage-confirm-upload] File status confirmed', { fileId, schema, table });
  } finally {
    await pg.end();
  }
};

const handler: FunctionHandler<StorageConfirmUploadPayload> = async (
  params,
  context
) => {
  const { job, log } = context;
  const { file_id, key, bucket_id, mime_type, schema, table } = params;

  if (!file_id || !key || !bucket_id) {
    throw new Error('Missing required fields: file_id, key, or bucket_id');
  }

  log.info('[storage-confirm-upload] Processing', {
    file_id,
    key,
    bucket_id,
    schema,
    table,
  });

  const s3 = createS3Client();

  const storageSchema = schema
    ? schema.replace(/-app-public$/, '-storage-public')
    : 'storage_public';

  let bucketName = bucket_id;
  if (schema && job.databaseId) {
    try {
      bucketName = await resolveS3BucketName(bucket_id, storageSchema, job.databaseId);
      log.info('[storage-confirm-upload] Resolved bucket name', { bucket_id, bucketName });
    } catch (err) {
      log.warn('[storage-confirm-upload] Could not resolve bucket, using bucket_id', {
        bucket_id,
        error: (err as Error).message,
      });
    }
  }

  const exists = await checkFileExistsInS3(s3, bucketName, key);

  if (!exists) {
    log.info('[storage-confirm-upload] File not found in S3, will retry', {
      bucket: bucketName,
      key,
    });
    throw new Error(`File not found in S3: ${bucketName}/${key}`);
  }

  log.info('[storage-confirm-upload] File exists in S3', { bucket: bucketName, key });

  const targetSchema = schema || storageSchema;
  const targetTable = table || 'app_files';

  await confirmFileUploaded(file_id, targetSchema, targetTable);

  return {
    success: true,
    file_id,
    bucket: bucketName,
    key,
  };
};

export default handler;
