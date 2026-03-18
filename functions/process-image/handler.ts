import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { FunctionContext, FunctionHandler } from '@constructive-io/fn-runtime';
import { getPgPool } from 'pg-cache';
import sharp from 'sharp';
import { Readable } from 'stream';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VersionConfig {
  name: string;
  maxWidth: number;
  maxHeight: number;
}

/** Process a file from files_store_public.files */
interface ProcessFileParams {
  file_id: string;
  database_id: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateIdentifier(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid SQL identifier: "${name}"`);
  }
  return name;
}

function validateQualifiedName(name: string): string {
  const parts = name.split('.');
  if (parts.length < 1 || parts.length > 3) {
    throw new Error(`Invalid qualified name: "${name}"`);
  }
  parts.forEach(validateIdentifier);
  return name;
}

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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function deleteS3Objects(
  s3: S3Client,
  bucket: string,
  keys: string[],
  log: FunctionContext['log'],
): Promise<void> {
  for (const key of keys) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      log.info(`[process-image] rolled back: deleted ${key}`);
    } catch (err) {
      log.error(`[process-image] rollback failed for ${key}`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Process a file from files_store_public.files
//
// Locks the row with FOR UPDATE SKIP LOCKED, transitions status through
// pending -> processing -> ready, generates thumbnail + medium versions,
// inserts version rows, and writes back-references to the domain table.
// ---------------------------------------------------------------------------

async function handleFileMode(
  params: ProcessFileParams,
  context: FunctionContext,
): Promise<unknown> {
  const { log, env } = context;
  const pool = createPgPool(env);
  const s3 = createS3Client(env);
  const bucket = env.BUCKET_NAME || 'test-bucket';

  // ---------------------------------------------------------------
  // Step 1: SELECT ... FOR UPDATE SKIP LOCKED
  // Prevents concurrent workers from processing the same file.
  // ---------------------------------------------------------------
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT * FROM files_store_public.files
       WHERE id = $1 AND database_id = $2 AND status = 'pending'
       FOR UPDATE SKIP LOCKED`,
      [params.file_id, params.database_id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      log.info('[process-image] skipped: row not found, not pending, or locked by another worker');
      return { skipped: true, reason: 'not_pending_or_locked' };
    }

    const file = rows[0];

    // Transition to processing
    await client.query(
      `UPDATE files_store_public.files SET status = 'processing' WHERE id = $1 AND database_id = $2`,
      [file.id, file.database_id]
    );

    await client.query('COMMIT');

    // ---------------------------------------------------------------
    // Step 2: Get MIME type from S3 (not stored in files table)
    // ---------------------------------------------------------------
    const headResult = await s3.send(new GetObjectCommand({
      Bucket: bucket,
      Key: file.key,
    }));
    const mimeType = headResult.ContentType ?? 'application/octet-stream';

    // Update origin with detected mime_type
    await pool.query(
      `UPDATE files_store_public.files SET mime_type = $3 WHERE id = $1 AND database_id = $2`,
      [file.id, file.database_id, mimeType]
    );

    // Check file size before downloading
    const maxFileSize = Number(env.MAX_FILE_SIZE) || Number(env.MAX_IMAGE_SIZE) || 52_428_800; // 50MB
    if (headResult.ContentLength && headResult.ContentLength > maxFileSize) {
      log.warn(`[process-image] file too large (${headResult.ContentLength} bytes, max ${maxFileSize}), marking as ready`);
      await pool.query(
        `UPDATE files_store_public.files SET status = 'ready' WHERE id = $1 AND database_id = $2`,
        [file.id, file.database_id]
      );
      return { success: true, mime: mimeType, skipped: true, reason: 'file_too_large' };
    }

    if (!mimeType.startsWith('image/')) {
      // Non-image: mark as ready immediately, no versions to generate
      await pool.query(
        `UPDATE files_store_public.files SET status = 'ready' WHERE id = $1 AND database_id = $2`,
        [file.id, file.database_id]
      );
      return { success: true, mime: mimeType, versions: 0 };
    }

    // ---------------------------------------------------------------
    // Step 3: Download original and generate versions
    // ---------------------------------------------------------------
    const baseKey = file.key.replace(/_origin$/, '');
    const originalBuffer = await streamToBuffer(headResult.Body as Readable);
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();

    const uploadedS3Keys: string[] = [];
    const versionRows: Array<{
      key: string;
      etag: string;
      mime: string;
      width: number;
      height: number;
    }> = [];

    try {
      // Generate thumbnail (150x150, skip if original is smaller)
      if ((metadata.width ?? 0) > 150 || (metadata.height ?? 0) > 150) {
        const thumbKey = `${baseKey}_thumbnail`;
        const thumbBuffer = await image.clone()
          .resize(150, 150, { fit: 'cover' }).jpeg().toBuffer();

        const putResult = await s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: thumbKey,
          Body: thumbBuffer,
          ContentType: 'image/jpeg',
        }));

        uploadedS3Keys.push(thumbKey);
        versionRows.push({
          key: thumbKey,
          etag: putResult.ETag ?? '',
          mime: 'image/jpeg',
          width: 150,
          height: 150,
        });
      }

      // Generate medium (max 1200px, skip if original is smaller)
      if ((metadata.width ?? 0) > 1200 || (metadata.height ?? 0) > 1200) {
        const medKey = `${baseKey}_medium`;
        const medResult = await image.clone()
          .resize(1200, null, { withoutEnlargement: true }).jpeg()
          .toBuffer({ resolveWithObject: true });

        const putResult = await s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: medKey,
          Body: medResult.data,
          ContentType: 'image/jpeg',
        }));

        uploadedS3Keys.push(medKey);
        versionRows.push({
          key: medKey,
          etag: putResult.ETag ?? '',
          mime: 'image/jpeg',
          width: 1200,
          height: medResult.info.height,
        });
      }

      // ---------------------------------------------------------------
      // Step 4: Transactional batch commit
      // All version row INSERTs + origin status update in single transaction.
      // ---------------------------------------------------------------
      const txClient = await pool.connect();
      try {
        await txClient.query('BEGIN');

        for (const ver of versionRows) {
          await txClient.query(
            `INSERT INTO files_store_public.files
               (database_id, bucket_key, key, status, etag, created_by,
                source_table, source_column, source_id, origin_id, mime_type)
             VALUES ($1, $2, $3, 'ready', $4, $5, $6, $7, $8, $9, $10)`,
            [
              file.database_id, file.bucket_key, ver.key, ver.etag,
              file.created_by, file.source_table, file.source_column, file.source_id,
              file.id, ver.mime,
            ]
          );
        }

        // Mark origin as ready
        await txClient.query(
          `UPDATE files_store_public.files SET status = 'ready' WHERE id = $1 AND database_id = $2`,
          [file.id, file.database_id]
        );

        await txClient.query('COMMIT');
      } catch (txErr: any) {
        await txClient.query('ROLLBACK');

        // ---------------------------------------------------------------
        // Graceful deleting handling:
        // If the file was marked 'deleting' during processing (source row
        // deleted), the state machine rejects processing->ready. This is
        // correct behavior -- the file is already marked for deletion.
        // ---------------------------------------------------------------
        if (txErr.message?.includes('Invalid status transition')) {
          log.info('[process-image] file transitioned to deleting during processing, exiting gracefully');
          await deleteS3Objects(s3, bucket, uploadedS3Keys, log);
          return { success: true, reason: 'file_marked_deleting_during_processing' };
        }
        throw txErr;
      } finally {
        txClient.release();
      }

      // ---------------------------------------------------------------
      // Step 5: Write version info to domain table (if back-reference populated)
      // ---------------------------------------------------------------
      if (file.source_table && file.source_column && file.source_id && versionRows.length > 0) {
        validateQualifiedName(file.source_table);
        validateIdentifier(file.source_column);

        const versionsArray = versionRows.map((v) => ({
          key: v.key,
          mime: v.mime,
          width: v.width,
          height: v.height,
        }));

        const sourceClient = await pool.connect();
        try {
          await sourceClient.query('BEGIN');
          await sourceClient.query(
            `SELECT set_config('app.database_id', $1, true)`,
            [String(file.database_id)]
          );
          await sourceClient.query(
            `UPDATE ${file.source_table}
             SET ${file.source_column} = jsonb_set(
               ${file.source_column}::jsonb,
               '{versions}',
               $1::jsonb
             )
             WHERE id = $2`,
            [JSON.stringify(versionsArray), file.source_id]
          );
          await sourceClient.query('COMMIT');
        } catch (domainUpdateErr) {
          await sourceClient.query('ROLLBACK');
          throw domainUpdateErr;
        } finally {
          sourceClient.release();
        }
      } else if (versionRows.length > 0) {
        log.info(
          `[process-image] source_* not yet populated, skipping domain write-back. ` +
          `Versions will be written when domain trigger fires. file_id=${file.id}`
        );
      }

      return { success: true, versions: versionRows.length };
    } catch (processingErr) {
      // ---------------------------------------------------------------
      // Partial failure recovery:
      // If any S3 upload or DB insert fails, explicitly delete any S3
      // objects that were uploaded before the failure.
      // ---------------------------------------------------------------
      await deleteS3Objects(s3, bucket, uploadedS3Keys, log);

      try {
        await pool.query(
          `UPDATE files_store_public.files SET status = 'error', status_reason = $3
           WHERE id = $1 AND database_id = $2`,
          [file.id, file.database_id, (processingErr as Error).message]
        );
      } catch (statusErr) {
        log.error('[process-image] failed to mark file as error', statusErr);
      }

      throw processingErr;
    }
  } finally {
    client.release();
    s3.destroy();
  }
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------

const handler: FunctionHandler<ProcessFileParams> = async (params, context) => {
  return handleFileMode(params, context);
};

export default handler;
