import type { StorageContext } from '@constructive-io/fn-types';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { Logger } from '@pgpmjs/logger';
import { randomUUID } from 'crypto';

const meterLog = new Logger('storage-meter');

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

// ─── MetaSchema Table Resolution ─────────────────────────────────────────────

const STORAGE_TABLE_SQL = `
  SELECT s.schema_name, t.name AS table_name
  FROM metaschema_public."table" t
  JOIN metaschema_public.schema s ON t.schema_id = s.id
  WHERE t.database_id = $1
    AND t.name = 'platform_usage_log_storage'
  LIMIT 1
`;

const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_SCHEMA = 'constructive_usage_public';
const DEFAULT_TABLE = 'platform_usage_log_storage';
const CONFIG_TTL_MS = 60_000;

let _storageSchema = DEFAULT_SCHEMA;
let _storageTable = DEFAULT_TABLE;
let _cacheExpiresAt = 0;
let _resolvePromise: Promise<void> | null = null;

async function resolveStorageTable(pool: import('pg').Pool): Promise<void> {
  if (Date.now() < _cacheExpiresAt) return;
  if (_resolvePromise) return _resolvePromise;

  _resolvePromise = (async () => {
    try {
      const { rows } = await pool.query(STORAGE_TABLE_SQL, [DEFAULT_DATABASE_ID]);
      if (rows.length > 0) {
        _storageSchema = rows[0].schema_name;
        _storageTable = rows[0].table_name;
      }
    } catch {
      meterLog.debug('metaschema lookup unavailable — using default storage table names');
    }
    _cacheExpiresAt = Date.now() + CONFIG_TTL_MS;
    _resolvePromise = null;
  })();

  return _resolvePromise;
}

/**
 * Create a fire-and-forget storage metering callback backed by pg.
 *
 * Lazily creates a pg Pool from standard PG* env vars on first invocation.
 * Resolves table names dynamically from MetaSchema (scope-aware).
 * Returns undefined if PGHOST/DATABASE_URL is not set (metering disabled).
 */
export const createMeterCallback = (): StorageMeterCallback | undefined => {
  const env = process.env;
  if (!env.PGHOST && !env.DATABASE_URL) return undefined;

  let pool: import('pg').Pool | undefined;

  const getPool = (): import('pg').Pool => {
    if (pool) return pool;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg') as typeof import('pg');
    pool = new Pool({ max: 2 });
    return pool;
  };

  return (info) => {
    const p = getPool();
    resolveStorageTable(p)
      .then(() => {
        const id = randomUUID();
        const now = new Date();
        p.query(
          `INSERT INTO "${_storageSchema}"."${_storageTable}"
           (id, database_id, entity_id, actor_id, operation,
            bucket, key, size_bytes, duration_ms, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            id,
            info.databaseId ?? null,
            info.entityId ?? null,
            info.actorId ?? null,
            info.operation,
            info.bucket,
            info.key,
            info.sizeBytes,
            Math.round(info.durationMs),
            now
          ]
        ).catch((err: unknown) => {
          meterLog.warn(`storage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
        });
      })
      .catch((err: unknown) => {
        meterLog.warn(`storage resolve failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
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
