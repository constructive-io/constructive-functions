import type { FunctionContext, FunctionHandler } from '@constructive-io/fn-runtime';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getPgPool } from 'pg-cache';

type DeleteParams = {
  file_id: string;
  database_id: number;
  key: string;
};

const handler: FunctionHandler<DeleteParams> = async (
  params: DeleteParams,
  context: FunctionContext
) => {
  const { log, env } = context;

  log.info('[delete-s3-object] deleting', { key: params.key });

  const s3 = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const pool = getPgPool({
    host: env.PGHOST,
    port: Number(env.PGPORT || 5432),
    database: env.PGDATABASE || 'constructive',
    user: env.PGUSER,
    password: env.PGPASSWORD,
  });

  // Step 1: Delete from S3 (idempotent -- delete ignores missing keys)
  await s3.send(new DeleteObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: params.key,
  }));

  // Step 2: Delete the DB row
  const result = await pool.query(
    'DELETE FROM object_store_public.files WHERE id = $1 AND database_id = $2',
    [params.file_id, params.database_id]
  );

  log.info('[delete-s3-object] complete', {
    key: params.key,
    rowsDeleted: result.rowCount,
  });

  return { success: true, key: params.key };
};

export default handler;
