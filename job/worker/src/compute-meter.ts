/**
 * Compute metering — fire-and-forget usage logging for every job.
 *
 * Delegates to UsageClient which resolves table names dynamically from
 * MetaSchema module registration tables. Schema-qualified references
 * (invocations table + usage log) are discovered at runtime, not hardcoded.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects job throughput or latency.
 */

import type { Pool } from 'pg';

import type { MeterEntry } from './usage-client';
import { UsageClient } from './usage-client';

export type { MeterEntry };

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
 * Log a compute invocation to both the invocations and usage tables.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logComputeUsage(pool: Pool, entry: MeterEntry): void {
  getOrCreateClient(pool).logComputeUsage(entry);
}
