/**
 * Compute metering — fire-and-forget usage logging for every job.
 *
 * Resolves table names dynamically via ModuleLoader from MetaSchema.
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects job throughput or latency.
 */

import { AmbiguousScopeError, ModuleLoader } from '@constructive-io/module-loader';
import { randomUUID } from 'crypto';
import type { Pool } from 'pg';

export interface MeterEntry {
  jobId: number | string;
  taskIdentifier: string;
  databaseId?: string;
  actorId?: string;
  entityId?: string;
  durationMs: number;
  status: 'ok' | 'error';
  error?: string;
  payload?: unknown;
  result?: unknown;
  graphExecutionId?: string;
  nodeName?: string;
  dispatchType: 'inline' | 'http';
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
 * Log a compute invocation. Fire-and-forget: never throws.
 * Returns the generated invocation_id (UUID).
 */
export function logComputeUsage(pool: Pool, entry: MeterEntry): string {
  const invocationId = randomUUID();
  if (!entry.databaseId) return invocationId;
  const loader = getLoader(pool);
  const databaseId = entry.databaseId;

  const resolveInvocation = async () => {
    try {
      return await loader.invocation.load(databaseId, entry.scope ?? null);
    } catch (err) {
      if (err instanceof AmbiguousScopeError) {
        return await loader.invocation.loadDefault(databaseId);
      }
      throw err;
    }
  };

  resolveInvocation()
    .then(async (cfg) => {
      const now = new Date();
      const startedAt = new Date(now.getTime() - Math.round(entry.durationMs));
      await pool.query(
        `INSERT INTO "${cfg.publicSchema}"."${cfg.invocationsTable}"
         (id, database_id, actor_id, task_identifier, job_id,
          graph_execution_id, status, duration_ms,
          started_at, completed_at, payload, result, error,
          entity_id, node_name, dispatch_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          invocationId, databaseId, entry.actorId ?? null,
          entry.taskIdentifier, String(entry.jobId),
          entry.graphExecutionId ?? null, entry.status, Math.round(entry.durationMs),
          startedAt, now,
          entry.payload ? JSON.stringify(entry.payload) : null,
          entry.result ? JSON.stringify(entry.result) : null,
          entry.error ?? null, entry.entityId ?? null,
          entry.nodeName ?? null, entry.dispatchType,
        ]
      );
    })
    .catch(() => { /* fire-and-forget */ });

  return invocationId;
}
