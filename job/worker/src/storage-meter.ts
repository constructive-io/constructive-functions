/**
 * Storage metering — fire-and-forget usage logging for S3/MinIO operations.
 *
 * Delegates to @constructive-io/module-loader which resolves table names
 * dynamically from MetaSchema module registration tables.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects function execution or storage latency.
 */

import type { StorageEntry } from '@constructive-io/module-loader';
import { UsageLoader } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

export type { StorageEntry };

/** Module-level loader cache — reused across calls within the same pool. */
let _loader: UsageLoader | null = null;
let _pool: Pool | null = null;

function getOrCreateLoader(pool: Pool): UsageLoader {
  if (_loader && _pool === pool) return _loader;
  _loader = new UsageLoader(pool);
  _pool = pool;
  return _loader;
}

/**
 * Log a storage operation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logStorageUsage(pool: Pool, entry: StorageEntry): void {
  getOrCreateLoader(pool).logStorageUsage(entry);
}
