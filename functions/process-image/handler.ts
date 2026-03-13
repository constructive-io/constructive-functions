import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { FunctionContext, FunctionHandler } from '@constructive-io/fn-runtime';
import { getPgPool } from 'pg-cache';
import { extname } from 'path';
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

/** File mode: process a file from object_store_public.files */
interface ProcessFileParams {
  file_id: string;
  database_id: number;
}

/** Image mode: process JSONB image fields on an arbitrary table */
interface ProcessImageFieldParams {
  schema: string;
  table: string;
  idFields: string[];
  idValues: (string | number)[];
  fields: string[];
  versions?: VersionConfig[];
}

type ProcessParams = ProcessFileParams | ProcessImageFieldParams;

interface ImageFieldValue {
  url?: string;
  id?: string;
  key?: string;
  bucket?: string;
  provider?: string;
  mime?: string;
  filename?: string;
  versions?: ImageVersion[];
}

interface ImageVersion {
  name: string;
  key: string;
  bucket: string;
  url: string;
  width: number;
  height: number;
  mime: string;
}

const DEFAULT_VERSIONS: VersionConfig[] = [
  { name: 'thumbnail', maxWidth: 150, maxHeight: 150 },
  { name: 'medium', maxWidth: 600, maxHeight: 600 },
  { name: 'large', maxWidth: 1200, maxHeight: 1200 },
];

const PROCESSABLE_FORMATS = new Set([
  'jpeg', 'png', 'webp', 'gif', 'tiff', 'avif', 'heif', 'jp2',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isFileMode(params: ProcessParams): params is ProcessFileParams {
  return 'file_id' in params;
}

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

function parseS3Url(url: string): { bucket: string; key: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);

    const host = parsed.hostname;
    if (host.endsWith('.s3.amazonaws.com')) {
      const bucket = host.replace('.s3.amazonaws.com', '');
      return { bucket, key: parts.join('/') };
    }

    if (parts.length >= 2) {
      return { bucket: parts[0], key: parts.slice(1).join('/') };
    }
  } catch {
    // not a valid URL
  }
  return null;
}

function deriveVersionKey(originalKey: string, versionName: string): string {
  const ext = extname(originalKey);
  const base = ext ? originalKey.slice(0, -ext.length) : originalKey;
  return `${base}_${versionName}${ext}`;
}

function buildObjectUrl(
  env: Record<string, string | undefined>,
  bucket: string,
  key: string,
): string {
  const provider = env.BUCKET_PROVIDER || 'minio';
  if (provider === 'minio') {
    const endpoint = env.MINIO_ENDPOINT || 'http://localhost:9000';
    return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`;
  }
  const region = env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
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
// File Mode: process a file from object_store_public.files
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
      `SELECT * FROM object_store_public.files
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
      `UPDATE object_store_public.files SET status = 'processing' WHERE id = $1 AND database_id = $2`,
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

    // Check file size before downloading
    const maxFileSize = Number(env.MAX_FILE_SIZE) || Number(env.MAX_IMAGE_SIZE) || 52_428_800; // 50MB
    if (headResult.ContentLength && headResult.ContentLength > maxFileSize) {
      log.warn(`[process-image] file too large (${headResult.ContentLength} bytes, max ${maxFileSize}), marking as ready`);
      await pool.query(
        `UPDATE object_store_public.files SET status = 'ready' WHERE id = $1 AND database_id = $2`,
        [file.id, file.database_id]
      );
      return { success: true, mime: mimeType, skipped: true, reason: 'file_too_large' };
    }

    if (!mimeType.startsWith('image/')) {
      // Non-image: mark as ready immediately, no versions to generate
      await pool.query(
        `UPDATE object_store_public.files SET status = 'ready' WHERE id = $1 AND database_id = $2`,
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
            `INSERT INTO object_store_public.files
               (database_id, bucket_key, key, status, etag, created_by,
                source_table, source_column, source_id)
             VALUES ($1, $2, $3, 'ready', $4, $5, $6, $7, $8)`,
            [
              file.database_id, file.bucket_key, ver.key, ver.etag,
              file.created_by, file.source_table, file.source_column, file.source_id,
            ]
          );
        }

        // Mark origin as ready
        await txClient.query(
          `UPDATE object_store_public.files SET status = 'ready' WHERE id = $1 AND database_id = $2`,
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
          `UPDATE object_store_public.files SET status = 'error', status_reason = $3
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
// Image Mode: process JSONB image fields on an arbitrary table
//
// For each specified field, downloads the original image from S3, generates
// resized versions (thumbnail, medium, large by default), uploads them back,
// and updates the JSONB field with version metadata.
// ---------------------------------------------------------------------------

async function handleImageMode(
  params: ProcessImageFieldParams,
  context: FunctionContext,
): Promise<unknown> {
  const { log, env } = context;
  const {
    schema,
    table,
    idFields,
    idValues,
    fields,
    versions = DEFAULT_VERSIONS,
  } = params;

  // --- Validation ---

  if (!schema || !table) return { error: 'Missing schema or table' };
  if (!idFields?.length || !idValues?.length)
    return { error: 'Missing idFields or idValues' };
  if (idFields.length !== idValues.length)
    return { error: 'idFields and idValues must have same length' };
  if (!fields?.length) return { error: 'Missing fields' };

  validateIdentifier(schema);
  validateIdentifier(table);
  idFields.forEach(validateIdentifier);
  fields.forEach(validateIdentifier);

  const defaultBucket = env.BUCKET_NAME || 'test-bucket';

  log.info('[process-image] starting', {
    schema,
    table,
    idFields,
    fields,
    versionCount: versions.length,
  });

  const s3 = createS3Client(env);
  const pool = createPgPool(env);

  // --- Query the record ---

  const fieldList = fields.map((f: string) => `"${f}"`).join(', ');
  const whereClauses = idFields
    .map((f: string, i: number) => `"${f}" = $${i + 1}`)
    .join(' AND ');
  const selectSql = `SELECT ${fieldList} FROM "${schema}"."${table}" WHERE ${whereClauses}`;

  log.info('[process-image] querying record');
  const { rows } = await pool.query(selectSql, idValues);

  if (rows.length === 0) {
    s3.destroy();
    return { error: 'Record not found' };
  }

  const record = rows[0];
  const results: Record<string, unknown> = {};

  try {
    for (const field of fields) {
      const fieldValue: ImageFieldValue | null =
        typeof record[field] === 'string'
          ? JSON.parse(record[field])
          : record[field];

      if (!fieldValue) {
        log.info(`[process-image] field "${field}" is null, skipping`);
        results[field] = { skipped: true, reason: 'null_value' };
        continue;
      }

      if (fieldValue.versions && fieldValue.versions.length > 0) {
        log.info(
          `[process-image] field "${field}" already has ${fieldValue.versions.length} versions, skipping`,
        );
        results[field] = { skipped: true, reason: 'versions_exist' };
        continue;
      }

      // Resolve bucket + key
      let key = fieldValue.key;
      let bucket = fieldValue.bucket || defaultBucket;

      if (!key && fieldValue.url) {
        const parsed = parseS3Url(fieldValue.url);
        if (parsed) {
          key = parsed.key;
          bucket = parsed.bucket;
        }
      }

      if (!key) {
        log.warn(
          `[process-image] field "${field}" has no resolvable key, skipping`,
        );
        results[field] = { skipped: true, reason: 'no_key' };
        continue;
      }

      log.info(`[process-image] processing "${field}"`, { key, bucket });

      // --- Download original to buffer ---

      const response = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );

      const maxImageSize = Number(env.MAX_IMAGE_SIZE) || 52_428_800; // 50MB
      if (response.ContentLength && response.ContentLength > maxImageSize) {
        log.warn(
          `[process-image] field "${field}" file too large (${response.ContentLength} bytes, max ${maxImageSize}), skipping`,
        );
        results[field] = { skipped: true, reason: 'file_too_large', size: response.ContentLength };
        continue;
      }

      if (!(response.Body instanceof Readable)) {
        throw new Error(`S3 response body is not a readable stream for key=${key}`);
      }

      const originalBuffer = await streamToBuffer(response.Body);

      if (originalBuffer.length > maxImageSize) {
        log.warn(
          `[process-image] field "${field}" buffer too large (${originalBuffer.length} bytes, max ${maxImageSize}), skipping`,
        );
        results[field] = { skipped: true, reason: 'file_too_large', size: originalBuffer.length };
        continue;
      }

      // --- Gate: verify this is a processable image ---

      let metadata: sharp.Metadata;
      try {
        metadata = await sharp(originalBuffer).metadata();
      } catch {
        log.warn(`[process-image] field "${field}" is not a valid image, skipping`);
        results[field] = { skipped: true, reason: 'not_an_image' };
        continue;
      }

      if (!metadata.format || !PROCESSABLE_FORMATS.has(metadata.format)) {
        log.warn(
          `[process-image] field "${field}" has unsupported format "${metadata.format || 'unknown'}", skipping`,
        );
        results[field] = { skipped: true, reason: 'unsupported_format', format: metadata.format };
        continue;
      }

      const originalWidth = metadata.width || 0;
      const originalHeight = metadata.height || 0;

      if (!originalWidth || !originalHeight) {
        log.warn(`[process-image] field "${field}" has no dimensions, skipping`);
        results[field] = { skipped: true, reason: 'no_dimensions' };
        continue;
      }

      log.info(`[process-image] original: ${originalWidth}x${originalHeight} (${metadata.format})`);

      // --- Generate versions ---

      const generatedVersions: ImageVersion[] = [];
      const uploadedKeys: string[] = [];

      try {
        for (const ver of versions) {
          if (originalWidth <= ver.maxWidth && originalHeight <= ver.maxHeight) {
            log.info(
              `[process-image] original (${originalWidth}x${originalHeight}) fits within ${ver.name} (${ver.maxWidth}x${ver.maxHeight}), skipping`,
            );
            continue;
          }

          const resized = await sharp(originalBuffer)
            .resize(ver.maxWidth, ver.maxHeight, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .toBuffer({ resolveWithObject: true });

          const vKey = deriveVersionKey(key, ver.name);
          const vUrl = buildObjectUrl(env, bucket, vKey);
          const mime = resized.info.format
            ? `image/${resized.info.format}`
            : (fieldValue.mime || 'image/jpeg');

          const uploadResult = await new Upload({
            client: s3,
            params: {
              Bucket: bucket,
              Key: vKey,
              Body: resized.data,
              ContentType: mime,
            },
          }).done();

          uploadedKeys.push(vKey);

          generatedVersions.push({
            name: ver.name,
            key: vKey,
            bucket,
            url: uploadResult.Location || vUrl,
            width: resized.info.width,
            height: resized.info.height,
            mime,
          });

          log.info(
            `[process-image] uploaded ${ver.name}: ${resized.info.width}x${resized.info.height}`,
          );
        }
      } catch (err) {
        log.error(
          `[process-image] version generation failed for "${field}", rolling back ${uploadedKeys.length} uploads`,
          err,
        );
        await deleteS3Objects(s3, bucket, uploadedKeys, log);
        throw err;
      }

      // --- Update database (rollback uploads on failure) ---

      if (generatedVersions.length > 0) {
        const updatedValue: ImageFieldValue = {
          ...fieldValue,
          versions: generatedVersions,
        };

        const updateWhere = idFields
          .map((f: string, i: number) => `"${f}" = $${i + 2}`)
          .join(' AND ');
        const updateSql = `UPDATE "${schema}"."${table}" SET "${field}" = $1::jsonb WHERE ${updateWhere}`;
        const updateValues = [JSON.stringify(updatedValue), ...idValues];

        try {
          await pool.query(updateSql, updateValues);
          log.info(
            `[process-image] updated "${field}" with ${generatedVersions.length} versions`,
          );
        } catch (err) {
          log.error(`[process-image] DB update failed for "${field}", rolling back uploads`, err);
          await deleteS3Objects(
            s3,
            bucket,
            generatedVersions.map((v) => v.key),
            log,
          );
          throw err;
        }
      }

      results[field] = {
        original: { width: originalWidth, height: originalHeight },
        versions: generatedVersions,
      };
    }
  } finally {
    s3.destroy();
  }

  log.info('[process-image] complete');
  return { success: true, results };
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------

const handler: FunctionHandler<ProcessParams> = async (params, context) => {
  if (isFileMode(params)) {
    return handleFileMode(params, context);
  }
  return handleImageMode(params as ProcessImageFieldParams, context);
};

export default handler;
