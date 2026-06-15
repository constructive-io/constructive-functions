/**
 * UsageLoader — resolves usage/metering table names from MetaSchema
 * and provides fire-and-forget INSERT helpers.
 *
 * Multi-database: pass different databaseId to resolve tables for
 * platform scope vs tenant scope.
 */

import { Logger } from '@pgpmjs/logger';
import { randomUUID } from 'crypto';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { InferenceEntry, MeterEntry, StorageEntry, UsageTableConfig } from './types';
import { DEFAULT_DATABASE_ID, DEFAULT_TTL_MS } from './types';

const log = new Logger('module-loader:usage');

// ─── MetaSchema Resolution ────────────────────────────────────────────────────

const USAGE_TABLES_SQL = `
  SELECT s.schema_name, t.name AS table_name
  FROM metaschema_public."table" t
  JOIN metaschema_public.schema s ON t.schema_id = s.id
  WHERE t.database_id = $1
    AND t.name = ANY($2)
`;

const KNOWN_TABLES = [
  'platform_function_invocations',
  'platform_usage_log_computes',
  'platform_usage_log_inferences',
  'platform_usage_log_storage',
] as const;

/** Default config used when MetaSchema is unavailable */
export const USAGE_DEFAULTS: UsageTableConfig = {
  invocationsSchema: 'constructive_compute_public',
  invocationsTable: 'platform_function_invocations',
  computeUsageSchema: 'constructive_usage_public',
  computeUsageTable: 'platform_usage_log_computes',
  inferenceUsageSchema: 'constructive_usage_public',
  inferenceUsageTable: 'platform_usage_log_inferences',
  storageUsageSchema: 'constructive_usage_public',
  storageUsageTable: 'platform_usage_log_storage',
};

// ─── UsageLoader Class ────────────────────────────────────────────────────────

export class UsageLoader {
  private pool: Pool;
  private defaultDatabaseId: string;
  private cache: TtlCache<UsageTableConfig>;

  constructor(pool: Pool, databaseId: string = DEFAULT_DATABASE_ID, ttlMs: number = DEFAULT_TTL_MS) {
    this.pool = pool;
    this.defaultDatabaseId = databaseId;
    this.cache = new TtlCache<UsageTableConfig>(ttlMs);
  }

  /**
   * Resolve usage table config for a database.
   * Multi-database: call with different databaseId for platform vs tenant.
   */
  async resolve(databaseId?: string): Promise<UsageTableConfig> {
    const dbId = databaseId ?? this.defaultDatabaseId;
    const cached = this.cache.get(dbId);
    if (cached !== undefined) return cached;

    try {
      const { rows } = await this.pool.query(USAGE_TABLES_SQL, [
        dbId,
        [...KNOWN_TABLES],
      ]);

      const config: UsageTableConfig = { ...USAGE_DEFAULTS };
      for (const row of rows) {
        switch (row.table_name) {
          case 'platform_function_invocations':
            config.invocationsSchema = row.schema_name;
            break;
          case 'platform_usage_log_computes':
            config.computeUsageSchema = row.schema_name;
            break;
          case 'platform_usage_log_inferences':
            config.inferenceUsageSchema = row.schema_name;
            break;
          case 'platform_usage_log_storage':
            config.storageUsageSchema = row.schema_name;
            break;
        }
      }

      this.cache.set(dbId, config);
      return config;
    } catch {
      log.debug(`metaschema lookup unavailable for database ${dbId} — using defaults`);
      this.cache.set(dbId, USAGE_DEFAULTS);
      return USAGE_DEFAULTS;
    }
  }

  // ─── Compute Metering ─────────────────────────────────────────────────

  /**
   * Log a compute invocation. Fire-and-forget: never throws.
   * Returns the generated invocation_id (UUID).
   *
   * Multi-database: uses entry.databaseId to resolve the correct tenant's tables.
   */
  logComputeUsage(entry: MeterEntry): string {
    const invocationId = randomUUID();
    this.resolve(entry.databaseId)
      .then((cfg) => this.insertCompute(cfg, entry, invocationId))
      .catch((err) => {
        log.warn(`compute usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
    return invocationId;
  }

  private async insertCompute(cfg: UsageTableConfig, entry: MeterEntry, invocationId: string): Promise<void> {
    const now = new Date();
    const startedAt = new Date(now.getTime() - Math.round(entry.durationMs));

    this.pool
      .query(
        `INSERT INTO "${cfg.invocationsSchema}"."${cfg.invocationsTable}"
         (id, database_id, actor_id, task_identifier, job_id,
          graph_execution_id, status, duration_ms,
          started_at, completed_at, payload, result, error,
          entity_id, node_name, dispatch_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
          entry.entityId ?? null,
          entry.nodeName ?? null,
          entry.dispatchType,
        ]
      )
      .catch((err) => {
        log.warn(`invocation log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });

    this.pool
      .query(
        `INSERT INTO "${cfg.computeUsageSchema}"."${cfg.computeUsageTable}"
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
          now,
        ]
      )
      .catch((err) => {
        log.warn(`compute usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  // ─── Inference Metering ───────────────────────────────────────────────

  /**
   * Log an inference invocation. Fire-and-forget: never throws.
   */
  logInferenceUsage(entry: InferenceEntry): void {
    this.resolve(entry.databaseId)
      .then((cfg) => this.insertInference(cfg, entry))
      .catch((err) => {
        log.warn(`inference usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  private async insertInference(cfg: UsageTableConfig, entry: InferenceEntry): Promise<void> {
    const id = randomUUID();
    const now = new Date();

    this.pool
      .query(
        `INSERT INTO "${cfg.inferenceUsageSchema}"."${cfg.inferenceUsageTable}"
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
  }

  // ─── Storage Metering ─────────────────────────────────────────────────

  /**
   * Log a storage operation. Fire-and-forget: never throws.
   */
  logStorageUsage(entry: StorageEntry): void {
    this.resolve(entry.databaseId)
      .then((cfg) => this.insertStorage(cfg, entry))
      .catch((err) => {
        log.warn(`storage usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  private async insertStorage(cfg: UsageTableConfig, entry: StorageEntry): Promise<void> {
    const id = randomUUID();
    const now = new Date();

    this.pool
      .query(
        `INSERT INTO "${cfg.storageUsageSchema}"."${cfg.storageUsageTable}"
         (id, database_id, entity_id, actor_id, operation,
          bucket, key, size_bytes, duration_ms, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          entry.databaseId ?? null,
          entry.entityId ?? null,
          entry.actorId ?? null,
          entry.operation,
          entry.bucket,
          entry.key,
          entry.sizeBytes,
          Math.round(entry.durationMs),
          now,
        ]
      )
      .catch((err) => {
        log.warn(`storage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  invalidate(databaseId?: string): void {
    if (databaseId) {
      this.cache.delete(databaseId);
    } else {
      this.cache.clear();
    }
  }
}
