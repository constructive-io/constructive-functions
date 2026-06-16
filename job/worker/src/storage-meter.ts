/**
 * Storage metering — fire-and-forget usage logging for S3/MinIO operations.
 *
 * Resolves table names dynamically via ModuleLoader from MetaSchema.
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects function execution or storage latency.
 */

import { AmbiguousScopeError, ModuleLoader } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

export interface StorageEntry {
  databaseId: string;
  entityId?: string;
  actorId?: string;
  operation: 'read' | 'write' | 'delete';
  bucket: string;
  key: string;
  sizeBytes: number;
  durationMs: number;
  scope?: string | null;
}

let _loader: ModuleLoader | null = null;
let _pool: Pool | null = null;

function getLoader(pool: Pool): ModuleLoader {
  if (_loader && _pool === pool) return _loader;
  _loader = new ModuleLoader({ pool });
  _pool = pool;
  return _loader;
}

async function resolveComputeLog(pool: Pool, databaseId: string, scope: string | null) {
  try {
    return await getLoader(pool).computeLog.load(databaseId, scope);
  } catch (err) {
    if (err instanceof AmbiguousScopeError) {
      return await getLoader(pool).computeLog.load(databaseId, 'app');
    }
    throw err;
  }
}

/**
 * Log a storage operation. Fire-and-forget: never throws.
 */
export function logStorageUsage(pool: Pool, entry: StorageEntry): void {
  resolveComputeLog(pool, entry.databaseId, entry.scope ?? null)
    .then(async (cfg) => {
      await pool.query(
        `INSERT INTO "${cfg.publicSchema}"."${cfg.computeLogTable}"
         (database_id, entity_id, actor_id, operation, bucket, key, size_bytes, duration_ms)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          entry.databaseId, entry.entityId ?? null, entry.actorId ?? null,
          entry.operation, entry.bucket, entry.key,
          entry.sizeBytes, Math.round(entry.durationMs),
        ]
      );
    })
    .catch(() => { /* fire-and-forget */ });
}
