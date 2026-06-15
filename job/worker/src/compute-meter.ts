/**
 * Compute metering — fire-and-forget usage logging for every job.
 *
 * Delegates to @constructive-io/usage-loader which resolves table names
 * dynamically from MetaSchema module registration tables.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects job throughput or latency.
 */

import type { Pool } from 'pg';
import { UsageLoader } from '@constructive-io/usage-loader';
import type { MeterEntry } from '@constructive-io/usage-loader';

export type { MeterEntry };

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
 * Log a compute invocation to both the invocations and usage tables.
 * Fire-and-forget: returns immediately, never throws.
 * Returns the generated invocation_id (UUID).
 */
export function logComputeUsage(pool: Pool, entry: MeterEntry): string {
  return getOrCreateLoader(pool).logComputeUsage(entry);
}
