/**
 * Inference metering — fire-and-forget usage logging for LLM calls.
 *
 * Resolves table names dynamically via ModuleLoader from MetaSchema.
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects inference latency or response delivery.
 */

import { AmbiguousScopeError, ModuleLoader } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

export interface InferenceEntry {
  databaseId: string;
  entityId?: string;
  actorId?: string;
  requestId?: string;
  model: string;
  provider: string;
  service: 'chat' | 'embed';
  operation: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: 'ok' | 'error';
  errorType?: string;
  rawUsage?: unknown;
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

/**
 * Log an inference invocation. Fire-and-forget: never throws.
 */
async function resolveComputeLog(pool: Pool, databaseId: string, scope: string | null) {
  try {
    return await getLoader(pool).computeLog.load(databaseId, scope);
  } catch (err) {
    if (err instanceof AmbiguousScopeError) {
      return await getLoader(pool).computeLog.loadDefault(databaseId);
    }
    throw err;
  }
}

export function logInferenceUsage(pool: Pool, entry: InferenceEntry): void {
  resolveComputeLog(pool, entry.databaseId, entry.scope ?? null)
    .then(async (cfg) => {
      await pool.query(
        `INSERT INTO "${cfg.publicSchema}"."${cfg.computeLogTable}"
         (database_id, entity_id, actor_id, request_id,
          model, provider, service, operation,
          input_tokens, output_tokens, total_tokens,
          latency_ms, status, error_type, raw_usage)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          entry.databaseId, entry.entityId ?? null, entry.actorId ?? null,
          entry.requestId ?? null, entry.model, entry.provider,
          entry.service, entry.operation,
          entry.inputTokens, entry.outputTokens, entry.totalTokens,
          Math.round(entry.latencyMs), entry.status, entry.errorType ?? null,
          entry.rawUsage ? JSON.stringify(entry.rawUsage) : null,
        ]
      );
    })
    .catch(() => { /* fire-and-forget */ });
}
