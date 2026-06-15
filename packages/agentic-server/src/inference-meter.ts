/**
 * Inference metering — fire-and-forget usage logging for LLM calls.
 *
 * Delegates to @constructive-io/usage-loader which resolves table names
 * dynamically from MetaSchema module registration tables.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects inference latency or response delivery.
 */

import type { Pool } from 'pg';
import { UsageLoader, getLoader, _resetLoaderCache } from '@constructive-io/usage-loader';
import type { InferenceEntry } from '@constructive-io/usage-loader';

export type { InferenceEntry };

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
 * Log an inference invocation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logInferenceUsage(pool: Pool, entry: InferenceEntry): void {
  getOrCreateLoader(pool).logInferenceUsage(entry);
}

/** Reset the module-level cache (for testing). */
export function _resetCache(): void {
  _loader = null;
  _pool = null;
}
