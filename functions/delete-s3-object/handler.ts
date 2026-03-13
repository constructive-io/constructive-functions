import type { FunctionContext, FunctionHandler } from '@constructive-io/fn-runtime';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getPgPool } from 'pg-cache';

type DeleteParams = {
  file_id: string;
  database_id: number;
  key: string;
};

function createS3Client(env: Record<string, string | undefined>): S3Client {
  const provider = env.BUCKET_PROVIDER || 'minio';
  const isMinio = provider === 'minio';
  return new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY || 'minioadmin',
      secretAccessKey: env.AWS_SECRET_KEY || 'minioadmin',
    },
    ...(isMinio
      ? {
          endpoint: env.MINIO_ENDPOINT || 'http://localhost:9000',
          forcePathStyle: true,
        }
      : {}),
  });
}

function createPgPool(env: Record<string, string | undefined>) {
  return getPgPool({
    host: env.PGHOST || 'localhost',
    port: Number(env.PGPORT || 5432),
    database: env.PGDATABASE || 'constructive',
    user: env.PGUSER || 'postgres',
    password: env.PGPASSWORD || 'password',
  });
}

const handler: FunctionHandler<DeleteParams> = async (
  params: DeleteParams,
  context: FunctionContext
) => {
  const { log, env } = context;

  log.info('[delete-s3-object] deleting', { key: params.key });

  const s3 = createS3Client(env);
  const pool = createPgPool(env);

  try {
    // Step 1: Delete from S3 (idempotent -- delete ignores missing keys)
    await s3.send(new DeleteObjectCommand({
      Bucket: env.BUCKET_NAME || 'test-bucket',
      Key: params.key,
    }));

    // Step 2: Delete the DB row
    const result = await pool.query(
      'DELETE FROM files_store_public.files WHERE id = $1 AND database_id = $2',
      [params.file_id, params.database_id]
    );

    log.info('[delete-s3-object] complete', {
      key: params.key,
      rowsDeleted: result.rowCount,
    });

    return { success: true, key: params.key };
  } finally {
    s3.destroy();
  }
};

export default handler;
