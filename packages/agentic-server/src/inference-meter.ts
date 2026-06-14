/**
 * Inference metering — fire-and-forget usage logging for LLM calls.
 *
 * Self-contained implementation that resolves table names dynamically
 * from MetaSchema module registration tables. Falls back to well-known
 * defaults when MetaSchema is unavailable.
 *
 * All writes are non-blocking: errors are logged and swallowed so
 * metering never affects inference latency or response delivery.
 */

import { Logger } from '@pgpmjs/logger';
import { randomUUID } from 'crypto';
import type { Pool } from 'pg';

const log = new Logger('inference-meter');

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Table Resolution ─────────────────────────────────────────────────────────

const INFERENCE_TABLE_SQL = `
  SELECT s.schema_name, t.name AS table_name
  FROM metaschema_public."table" t
  JOIN metaschema_public.schema s ON t.schema_id = s.id
  WHERE t.database_id = $1
    AND t.name = 'platform_usage_log_inferences'
  LIMIT 1
`;

const DEFAULT_SCHEMA = 'constructive_usage_public';
const DEFAULT_TABLE = 'platform_usage_log_inferences';
const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const CONFIG_TTL_MS = 60_000;

interface TableRef {
  schema: string;
  table: string;
}

let _cachedRef: TableRef | null = null;
let _cacheExpiresAt = 0;
let _resolvePromise: Promise<TableRef> | null = null;

/** Reset the module-level cache (for testing). */
export function _resetCache(): void {
  _cachedRef = null;
  _cacheExpiresAt = 0;
  _resolvePromise = null;
}

async function resolveTable(pool: Pool, databaseId: string): Promise<TableRef> {
  if (_cachedRef && Date.now() < _cacheExpiresAt) return _cachedRef;
  if (_resolvePromise) return _resolvePromise;

  _resolvePromise = (async () => {
    try {
      const { rows } = await pool.query(INFERENCE_TABLE_SQL, [databaseId]);
      const ref: TableRef =
        rows.length > 0
          ? { schema: rows[0].schema_name, table: rows[0].table_name }
          : { schema: DEFAULT_SCHEMA, table: DEFAULT_TABLE };
      _cachedRef = ref;
      _cacheExpiresAt = Date.now() + CONFIG_TTL_MS;
      _resolvePromise = null;
      return ref;
    } catch {
      log.debug('metaschema lookup unavailable — using default table names');
      const ref: TableRef = { schema: DEFAULT_SCHEMA, table: DEFAULT_TABLE };
      _cachedRef = ref;
      _cacheExpiresAt = Date.now() + CONFIG_TTL_MS;
      _resolvePromise = null;
      return ref;
    }
  })();

  return _resolvePromise;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Log an inference invocation to the usage log table.
 * Fire-and-forget: returns immediately, never throws.
 */
export function logInferenceUsage(pool: Pool, entry: InferenceEntry): void {
  const dbId = entry.databaseId ?? DEFAULT_DATABASE_ID;

  resolveTable(pool, dbId)
    .then((ref) => {
      const id = randomUUID();
      const now = new Date();

      pool
        .query(
          `INSERT INTO "${ref.schema}"."${ref.table}"
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
            now,
          ]
        )
        .catch((err) => {
          log.warn(`inference log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
        });
    })
    .catch((err) => {
      log.warn(`inference usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
    });
}
