/**
 * Inference metering — fire-and-forget usage logging for LLM calls.
 *
 * Logs to `constructive_usage_public.platform_usage_log_inferences`
 * after each chat completion or embedding request.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects inference latency or response delivery.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';
import { randomUUID } from 'crypto';

const log = new Logger('inference-meter');

export interface InferenceEntry {
  databaseId?: string;
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
}

/**
 * Log an inference invocation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logInferenceUsage(pool: Pool, entry: InferenceEntry): void {
  const id = randomUUID();
  const now = new Date();

  pool
    .query(
      `INSERT INTO "constructive_usage_public".platform_usage_log_inferences
       (id, database_id, entity_id, actor_id, request_id,
        model, provider, service, operation,
        input_tokens, output_tokens, total_tokens,
        latency_ms, status, error_type, raw_usage, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        id,
        entry.databaseId ?? null,
        entry.entityId ?? null,
        entry.actorId ?? null,
        entry.requestId ?? randomUUID(),
        entry.model,
        entry.provider,
        entry.service,
        entry.operation,
        entry.inputTokens,
        entry.outputTokens,
        entry.totalTokens,
        Math.round(entry.latencyMs),
        entry.status,
        entry.errorType ?? null,
        entry.rawUsage ? JSON.stringify(entry.rawUsage) : null,
        now
      ]
    )
    .catch((err) => {
      log.warn(`inference log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    });
}
