/**
 * Inference metering — fire-and-forget usage logging for LLM calls.
 *
 * Delegates to UsageClient which resolves table names dynamically from
 * MetaSchema module registration tables. The schema-qualified reference
 * for the inference usage log is discovered at runtime, not hardcoded.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects inference latency or response delivery.
 */

import type { Pool } from 'pg';

import { UsageClient } from '@constructive-io/knative-job-worker';
import type { InferenceEntry } from '@constructive-io/knative-job-worker';

export type { InferenceEntry };

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
 * Log an inference invocation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logInferenceUsage(pool: Pool, entry: InferenceEntry): void {
  getOrCreateClient(pool).logInferenceUsage(entry);
}
