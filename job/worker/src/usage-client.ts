/**
 * UsageClient — typed, fire-and-forget usage logging for compute and inference.
 *
 * Resolves table names dynamically from MetaSchema module registration tables
 * (metaschema_public.schema + metaschema_public.table) rather than hardcoding
 * schema-qualified references. Results are TTL-cached per client instance.
 *
 * When MetaSchema is unavailable (tests, bootstrapping) the client falls back
 * to the well-known default table names so logging still works.
 */

import { Logger } from '@pgpmjs/logger';
import { randomUUID } from 'crypto';
import type { Pool } from 'pg';

const log = new Logger('usage-client');

// ─── Module Resolution ────────────────────────────────────────────────────────

/**
 * Query to discover usage table locations from metaschema.
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

/** Well-known table names we look up in metaschema */
const KNOWN_TABLES = [
  'platform_function_invocations',
  'platform_usage_log_computes',
  'platform_usage_log_inferences',
  'platform_usage_log_storage',
] as const;

/** Default config used when metaschema is unavailable */
const DEFAULTS: UsageModuleConfig = {
  invocationsSchema: 'constructive_compute_public',
  invocationsTable: 'platform_function_invocations',
  computeUsageSchema: 'constructive_usage_public',
  computeUsageTable: 'platform_usage_log_computes',
  inferenceUsageSchema: 'constructive_usage_public',
  inferenceUsageTable: 'platform_usage_log_inferences',
  storageUsageSchema: 'constructive_usage_public',
  storageUsageTable: 'platform_usage_log_storage',
};

export interface UsageModuleConfig {
  invocationsSchema: string;
  invocationsTable: string;
  computeUsageSchema: string;
  computeUsageTable: string;
  inferenceUsageSchema: string;
  inferenceUsageTable: string;
  storageUsageSchema: string;
  storageUsageTable: string;
}

// ─── Entry Types ──────────────────────────────────────────────────────────────

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

// ─── UsageClient ──────────────────────────────────────────────────────────────

const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const CONFIG_TTL_MS = 60_000;

export class UsageClient {
  private pool: Pool;
  private databaseId: string;
  private config: UsageModuleConfig | null = null;
  private configPromise: Promise<UsageModuleConfig> | null = null;
  private configExpiresAt = 0;

  constructor(pool: Pool, databaseId: string = DEFAULT_DATABASE_ID) {
    this.pool = pool;
    this.databaseId = databaseId;
  }

  // ─── Config Resolution ────────────────────────────────────────────────

  private resolveConfig(): Promise<UsageModuleConfig> {
    if (this.config && Date.now() < this.configExpiresAt) {
      return Promise.resolve(this.config);
    }
    if (this.configPromise) return this.configPromise;
    this.configPromise = this.loadConfig();
    return this.configPromise;
  }

  private async loadConfig(): Promise<UsageModuleConfig> {
    try {
      const { rows } = await this.pool.query(USAGE_TABLES_SQL, [
        this.databaseId,
        [...KNOWN_TABLES],
      ]);

      const config: UsageModuleConfig = { ...DEFAULTS };
      for (const row of rows) {
        if (row.table_name === 'platform_function_invocations') {
          config.invocationsSchema = row.schema_name;
        }
        if (row.table_name === 'platform_usage_log_computes') {
          config.computeUsageSchema = row.schema_name;
        }
        if (row.table_name === 'platform_usage_log_inferences') {
          config.inferenceUsageSchema = row.schema_name;
        }
        if (row.table_name === 'platform_usage_log_storage') {
          config.storageUsageSchema = row.schema_name;
        }
      }

      this.config = config;
      this.configExpiresAt = Date.now() + CONFIG_TTL_MS;
      this.configPromise = null;

      log.debug(
        `resolved usage config: invocations=${config.invocationsSchema}.${config.invocationsTable}, ` +
          `compute=${config.computeUsageSchema}.${config.computeUsageTable}, ` +
          `inference=${config.inferenceUsageSchema}.${config.inferenceUsageTable}`
      );

      return config;
    } catch {
      log.debug('metaschema lookup unavailable — using default table names');
      this.config = DEFAULTS;
      this.configExpiresAt = Date.now() + CONFIG_TTL_MS;
      this.configPromise = null;
      return DEFAULTS;
    }
  }

  // ─── Compute Usage ────────────────────────────────────────────────────

  /**
   * Log a compute invocation to both the invocations and usage tables.
   * Fire-and-forget: returns immediately, never throws.
   */
  logComputeUsage(entry: MeterEntry): void {
    this.resolveConfig()
      .then((cfg) => this.insertComputeUsage(cfg, entry))
      .catch((err) => {
        log.warn(`compute usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  private async insertComputeUsage(cfg: UsageModuleConfig, entry: MeterEntry): Promise<void> {
    const invocationId = randomUUID();
    const now = new Date();
    const startedAt = new Date(now.getTime() - entry.durationMs);

    // INSERT into invocations table
    this.pool
      .query(
        `INSERT INTO "${cfg.invocationsSchema}"."${cfg.invocationsTable}"
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
          now,
        ]
      )
      .catch((err) => {
        log.warn(`invocation log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });

    // INSERT into usage log table
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
        log.warn(`usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  // ─── Inference Usage ──────────────────────────────────────────────────

  /**
   * Log an inference invocation to the usage log table.
   * Fire-and-forget: returns immediately, never throws.
   */
  logInferenceUsage(entry: InferenceEntry): void {
    this.resolveConfig()
      .then((cfg) => this.insertInferenceUsage(cfg, entry))
      .catch((err) => {
        log.warn(`inference usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  private async insertInferenceUsage(cfg: UsageModuleConfig, entry: InferenceEntry): Promise<void> {
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

  // ─── Storage Usage ─────────────────────────────────────────────────────

  /**
   * Log a storage operation to the usage log table.
   * Fire-and-forget: returns immediately, never throws.
   */
  logStorageUsage(entry: StorageEntry): void {
    this.resolveConfig()
      .then((cfg) => this.insertStorageUsage(cfg, entry))
      .catch((err) => {
        log.warn(`storage usage log failed (non-fatal): ${err instanceof Error ? err.message : String(err)}`);
      });
  }

  private async insertStorageUsage(cfg: UsageModuleConfig, entry: StorageEntry): Promise<void> {
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

/**
 * Create a UsageClient instance.
 * Convenience factory for callers that prefer a functional style.
 */
export function createUsageClient(pool: Pool, databaseId?: string): UsageClient {
  return new UsageClient(pool, databaseId);
}
