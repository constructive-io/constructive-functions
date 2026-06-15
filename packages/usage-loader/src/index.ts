/**
 * @constructive-io/usage-loader
 *
 * Shared usage metering module loader. Resolves table names dynamically from
 * MetaSchema module registration tables (metaschema_public.schema +
 * metaschema_public.table) with 60s TTL caching.
 *
 * Falls back to well-known default table names when MetaSchema is unavailable
 * (tests, bootstrapping, first deploy).
 */

import { Logger } from '@pgpmjs/logger';
import { randomUUID } from 'crypto';
import type { Pool } from 'pg';

const log = new Logger('usage-loader');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsageTableConfig {
  invocationsSchema: string;
  invocationsTable: string;
  computeUsageSchema: string;
  computeUsageTable: string;
  inferenceUsageSchema: string;
  inferenceUsageTable: string;
  storageUsageSchema: string;
  storageUsageTable: string;
}

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

export interface StorageEntry {
  databaseId?: string;
  entityId?: string;
  actorId?: string;
  operation: 'read' | 'write' | 'delete';
  bucket: string;
  key: string;
  sizeBytes: number;
  durationMs: number;
}

// ─── MetaSchema Resolution ────────────────────────────────────────────────────

/**
 * Query to discover usage table locations from MetaSchema.
 * Joins metaschema_public.table → metaschema_public.schema to resolve
 * the schema_name for each registered table.
 */
const USAGE_TABLES_SQL = `
  SELECT s.schema_name, t.name AS table_name
  FROM metaschema_public."table" t
  JOIN metaschema_public.schema s ON t.schema_id = s.id
  WHERE t.database_id = $1
    AND t.name = ANY($2)
`;

/** Well-known table names we look up in MetaSchema */
const KNOWN_TABLES = [
  'platform_function_invocations',
  'platform_usage_log_computes',
  'platform_usage_log_inferences',
  'platform_usage_log_storage',
] as const;

/** Default config used when MetaSchema is unavailable */
export const DEFAULTS: UsageTableConfig = {
  invocationsSchema: 'constructive_compute_public',
  invocationsTable: 'platform_function_invocations',
  computeUsageSchema: 'constructive_usage_public',
  computeUsageTable: 'platform_usage_log_computes',
  inferenceUsageSchema: 'constructive_usage_public',
  inferenceUsageTable: 'platform_usage_log_inferences',
  storageUsageSchema: 'constructive_usage_public',
  storageUsageTable: 'platform_usage_log_storage',
};

const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const CONFIG_TTL_MS = 60_000;

// ─── UsageLoader Class ────────────────────────────────────────────────────────

/**
 * Resolves and caches usage table configuration from MetaSchema.
 * One instance per pool. Reuse across multiple meter calls.
 */
export class UsageLoader {
  private pool: Pool;
  private databaseId: string;
  private config: UsageTableConfig | null = null;
  private configPromise: Promise<UsageTableConfig> | null = null;
  private configExpiresAt = 0;

  constructor(pool: Pool, databaseId: string = DEFAULT_DATABASE_ID) {
    this.pool = pool;
    this.databaseId = databaseId;
  }

  /**
   * Resolve the current table configuration. Cached for 60s.
   * Safe to call concurrently — deduplicates in-flight lookups.
   */
  resolve(): Promise<UsageTableConfig> {
    if (this.config && Date.now() < this.configExpiresAt) {
      return Promise.resolve(this.config);
    }
    if (this.configPromise) return this.configPromise;
    this.configPromise = this.load();
    return this.configPromise;
  }

  /** Force-clear the cache (for testing). */
  invalidate(): void {
    this.config = null;
    this.configExpiresAt = 0;
    this.configPromise = null;
  }

  private async load(): Promise<UsageTableConfig> {
    try {
      const { rows } = await this.pool.query(USAGE_TABLES_SQL, [
        this.databaseId,
        [...KNOWN_TABLES],
      ]);

      const config: UsageTableConfig = { ...DEFAULTS };
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

      this.config = config;
      this.configExpiresAt = Date.now() + CONFIG_TTL_MS;
      this.configPromise = null;
      return config;
    } catch {
      log.debug('metaschema lookup unavailable — using default table names');
      this.config = DEFAULTS;
      this.configExpiresAt = Date.now() + CONFIG_TTL_MS;
      this.configPromise = null;
      return DEFAULTS;
    }
  }

  // ─── Compute Metering ─────────────────────────────────────────────────

  /**
   * Log a compute invocation. Fire-and-forget: never throws.
   * Returns the generated invocation_id (UUID).
   */
  logComputeUsage(entry: MeterEntry): string {
    const invocationId = randomUUID();
    this.resolve()
      .then((cfg) => this.insertCompute(cfg, entry, invocationId))
      .catch((err) => {
        log.warn(`compute usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
    return invocationId;
  }

  private async insertCompute(cfg: UsageTableConfig, entry: MeterEntry, invocationId: string): Promise<void> {
    const now = new Date();
    const startedAt = new Date(now.getTime() - Math.round(entry.durationMs));

    // Insert invocation record
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

    // Insert usage log
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
    this.resolve()
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
    this.resolve()
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
}

// ─── Convenience Factory ──────────────────────────────────────────────────────

/** Module-level loader cache — one per pool instance. */
let _loader: UsageLoader | null = null;
let _pool: Pool | null = null;

/**
 * Get or create a UsageLoader for the given pool.
 * Reuses the same instance as long as the pool reference matches.
 */
export function getLoader(pool: Pool, databaseId?: string): UsageLoader {
  if (_loader && _pool === pool) return _loader;
  _loader = new UsageLoader(pool, databaseId);
  _pool = pool;
  return _loader;
}

/** Reset the module-level cache (for testing). */
export function _resetLoaderCache(): void {
  _loader = null;
  _pool = null;
}
