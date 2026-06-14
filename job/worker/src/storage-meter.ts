/**
 * Storage metering — fire-and-forget usage logging for S3/MinIO operations.
 *
 * Logs to `constructive_usage_public.platform_usage_log_storage`
 * after each read/write/delete against object storage.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects function execution or storage latency.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';
import { randomUUID } from 'crypto';

const log = new Logger('storage-meter');

export interface StorageEntry {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
  operation: 'read' | 'write' | 'delete';
  bucket: string;
  key: string;
  sizeBytes: number;
  durationMs: number;
}

/**
 * Log a storage operation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logStorageUsage(pool: Pool, entry: StorageEntry): void {
  const id = randomUUID();
  const now = new Date();

  pool
    .query(
      `INSERT INTO "constructive_usage_public".platform_usage_log_storage
       (id, database_id, entity_id, actor_id, operation,
        bucket, key, size_bytes, duration_ms, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        entry.databaseId ?? null,
        entry.entityId ?? null,
        entry.actorId ?? null,
        entry.operation,
        entry.bucket,
        entry.key,
        entry.sizeBytes,
        Math.round(entry.durationMs),
        now
      ]
    )
    .catch((err) => {
      log.warn(`storage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    });
}
