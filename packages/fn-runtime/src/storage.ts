import type { StorageContext } from '@constructive-io/fn-types';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { ModuleLoader } from '@constructive-io/module-loader';

export type StorageMeterCallback = (info: {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
  operation: 'read' | 'write' | 'delete';
  bucket: string;
  key: string;
  sizeBytes: number;
  durationMs: number;
}) => void;

/**
 * Create a fire-and-forget storage metering callback backed by ModuleLoader.
 *
 * Lazily creates a pg Pool from standard PG* env vars on first invocation.
 * Resolves table names dynamically from MetaSchema (scope-aware).
 * Returns undefined if PGHOST/DATABASE_URL is not set (metering disabled).
 */
export const createMeterCallback = (): StorageMeterCallback | undefined => {
  const env = process.env;
  if (!env.PGHOST && !env.DATABASE_URL) return undefined;

  let pool: import('pg').Pool | undefined;
  let loader: ModuleLoader | undefined;

  const getLoader = (): ModuleLoader => {
    if (loader) return loader;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg') as typeof import('pg');
    pool = new Pool({ max: 2 });
    loader = new ModuleLoader({ pool });
    return loader;
  };

  return (info) => {
    if (!info.databaseId) return;
    const databaseId = info.databaseId;
    getLoader().computeLog.loadDefault(databaseId)
      .then(async (cfg) => {
        await pool!.query(
          `INSERT INTO "${cfg.publicSchema}"."${cfg.computeLogTable}"
           (database_id, entity_id, actor_id, operation, bucket, key, size_bytes, duration_ms)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            databaseId, info.entityId ?? null, info.actorId ?? null,
            info.operation, info.bucket, info.key,
            info.sizeBytes, Math.round(info.durationMs),
          ]
        );
      })
      .catch(() => { /* fire-and-forget */ });
  };
};

type StorageHeaders = {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
};

/**
 * Create a StorageContext that wraps S3/MinIO operations with metering.
 *
 * When `onMeter` is provided, every read/write/delete fires a metering
 * callback after the operation completes. The callback is invoked
 * fire-and-forget — storage operations never block on metering.
 *
 * When S3 config env vars are absent, methods throw with a clear message.
 */
export const createStorageContext = (
  env: Record<string, string | undefined>,
  headers: StorageHeaders,
  onMeter?: StorageMeterCallback
): StorageContext => {
  const endpoint = env.S3_ENDPOINT || env.MINIO_ENDPOINT;
  const region = env.S3_REGION || env.AWS_REGION || 'us-east-1';
  const accessKeyId = env.S3_ACCESS_KEY || env.MINIO_ROOT_USER || env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.S3_SECRET_KEY || env.MINIO_ROOT_PASSWORD || env.AWS_SECRET_ACCESS_KEY;

  let client: S3Client | undefined;

  const getClient = (): S3Client => {
    if (client) return client;
    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'Storage context not available. Set S3_ACCESS_KEY/S3_SECRET_KEY (or MINIO_ROOT_USER/MINIO_ROOT_PASSWORD) environment variables.'
      );
    }
    client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true
    });
    return client;
  };

  const meter = (op: 'read' | 'write' | 'delete', bucket: string, key: string, sizeBytes: number, durationMs: number) => {
    if (!onMeter) return;
    try {
      onMeter({
        databaseId: headers.databaseId,
        entityId: headers.entityId,
        actorId: headers.actorId,
        operation: op,
        bucket,
        key,
        sizeBytes,
        durationMs
      });
    } catch {}
  };

  const read = async (bucket: string, key: string): Promise<Buffer> => {
    const s3 = getClient();
    const start = process.hrtime.bigint();
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const chunks: Uint8Array[] = [];
    if (res.Body) {
      for await (const chunk of res.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
    }
    const buf = Buffer.concat(chunks);
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    meter('read', bucket, key, buf.length, durationMs);
    return buf;
  };

  const write = async (
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | string
  ): Promise<void> => {
    const s3 = getClient();
    const sizeBytes = typeof body === 'string' ? Buffer.byteLength(body) : body.length;
    const start = process.hrtime.bigint();
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    meter('write', bucket, key, sizeBytes, durationMs);
  };

  const del = async (bucket: string, key: string): Promise<void> => {
    const s3 = getClient();
    const start = process.hrtime.bigint();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    meter('delete', bucket, key, 0, durationMs);
  };

  return { read, write, delete: del };
};
