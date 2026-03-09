import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import type { FunctionHandler } from '@constructive-io/fn-runtime';
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

interface ProcessImageParams {
  schema: string;
  table: string;
  idFields: string[];
  idValues: (string | number)[];
  fields: string[];
  versions?: VersionConfig[];
}

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateIdentifier(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid SQL identifier: "${name}"`);
  }
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

const PROCESSABLE_FORMATS = new Set([
  'jpeg', 'png', 'webp', 'gif', 'tiff', 'avif', 'heif', 'jp2',
]);

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function deleteS3Objects(
  s3: S3Client,
  objects: { bucket: string; key: string }[],
  log: { info: (...args: unknown[]) => void; error: (...args: unknown[]) => void },
): Promise<void> {
  for (const obj of objects) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: obj.bucket, Key: obj.key }));
      log.info(`[process-image] rolled back: deleted ${obj.key}`);
    } catch (err) {
      log.error(`[process-image] rollback failed for ${obj.key}`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const handler: FunctionHandler<ProcessImageParams> = async (params, context) => {
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
  const pool = getPgPool({
    host: env.PGHOST || 'localhost',
    port: Number(env.PGPORT || 5432),
    database: env.PGDATABASE || 'constructive',
    user: env.PGUSER || 'postgres',
    password: env.PGPASSWORD || 'password',
  });

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

      if (!(response.Body instanceof Readable)) {
        throw new Error(`S3 response body is not a readable stream for key=${key}`);
      }

      const originalBuffer = await streamToBuffer(response.Body);

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
        const mime = fieldValue.mime || 'image/jpeg';

        const uploadResult = await new Upload({
          client: s3,
          params: {
            Bucket: bucket,
            Key: vKey,
            Body: resized.data,
            ContentType: mime,
          },
        }).done();

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
            generatedVersions.map((v) => ({ bucket: v.bucket, key: v.key })),
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
};

export default handler;
