/**
 * Compute metering — fire-and-forget usage logging for every job.
 *
 * Logs to two tables:
 *   1. `constructive_compute_public.platform_function_invocations`
 *      — detailed per-invocation record (timing, payload, result, graph context)
 *   2. `constructive_usage_public.platform_usage_log_computes`
 *      — billing/metering record linked back via invocation_id
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects job throughput or latency.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';
import { randomUUID } from 'crypto';

const log = new Logger('compute-meter');

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
}

/**
 * Log a compute invocation to both the invocations and usage tables.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logComputeUsage(pool: Pool, entry: MeterEntry): void {
  const invocationId = randomUUID();
  const now = new Date();

  // Calculate started_at from completed_at - duration_ms
  const startedAt = new Date(now.getTime() - entry.durationMs);

  // INSERT into platform_function_invocations (fire-and-forget)
  pool
    .query(
      `INSERT INTO "constructive_compute_public".platform_function_invocations
       (id, database_id, actor_id, task_identifier, job_id,
        graph_execution_id, status, duration_ms,
        started_at, completed_at, payload, result, error, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        invocationId,
        entry.databaseId ?? null,
        entry.actorId ?? null,
        entry.taskIdentifier,
        typeof entry.jobId === 'string' ? parseInt(entry.jobId, 10) || 0 : entry.jobId,
        entry.graphExecutionId ?? null,
        entry.status,
        Math.round(entry.durationMs),
        startedAt,
        now,
        entry.payload ? JSON.stringify(entry.payload) : null,
        entry.result ? JSON.stringify(entry.result) : null,
        entry.error ?? null,
        now
      ]
    )
    .catch((err) => {
      log.warn(`invocation log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    });

  // INSERT into platform_usage_log_computes (fire-and-forget)
  pool
    .query(
      `INSERT INTO "constructive_usage_public".platform_usage_log_computes
       (id, database_id, entity_id, actor_id, task_identifier,
        job_id, invocation_id, status, duration_ms, error, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        randomUUID(),
        entry.databaseId ?? null,
        entry.entityId ?? null,
        entry.actorId ?? null,
        entry.taskIdentifier,
        typeof entry.jobId === 'string' ? parseInt(entry.jobId, 10) || 0 : entry.jobId,
        invocationId,
        entry.status,
        Math.round(entry.durationMs),
        entry.error ?? null,
        now
      ]
    )
    .catch((err) => {
      log.warn(`usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    });
}
