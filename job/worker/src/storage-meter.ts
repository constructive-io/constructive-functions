/**
 * Storage metering — fire-and-forget usage logging for S3/MinIO operations.
 *
 * Delegates to UsageClient which resolves table names dynamically from
 * MetaSchema module registration tables. Schema-qualified references
 * are discovered at runtime, not hardcoded.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects function execution or storage latency.
 */

import type { Pool } from 'pg';

import type { StorageEntry } from './usage-client';
import { UsageClient } from './usage-client';

export type { StorageEntry };

/** Module-level client cache — reused across calls within the same pool. */
let _client: UsageClient | null = null;
let _pool: Pool | null = null;

function getOrCreateClient(pool: Pool): UsageClient {
  if (_client && _pool === pool) return _client;
  _client = new UsageClient(pool);
  _pool = pool;
  return _client;
}

/**
 * Log a storage operation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logStorageUsage(pool: Pool, entry: StorageEntry): void {
  getOrCreateClient(pool).logStorageUsage(entry);
}
