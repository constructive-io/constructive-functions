/**
 * ComputeModuleLoader — resolves compute module schema/table names
 * dynamically from metaschema instead of hardcoding schema references.
 *
 * Queries metaschema_modules_public.function_module and
 * metaschema_modules_public.function_invocation_module, joined with
 * metaschema_public.schema to resolve schema names. Results are
 * TTL-cached per database_id.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { ComputeLogModuleConfig, ComputeModuleConfig, FunctionModuleConfig, InvocationModuleConfig } from './types';

const log = new Logger('compute:module-loader');

const FUNCTION_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    fm.definitions_table_name,
    fm.secret_definitions_table_name,
    fm.scope
  FROM metaschema_modules_public.function_module fm
  JOIN metaschema_public.schema s  ON fm.schema_id = s.id
  JOIN metaschema_public.schema ps ON fm.private_schema_id = ps.id
  WHERE fm.database_id = $1
`;

const INVOCATION_MODULE_SQL = `
  SELECT
    s.schema_name AS public_schema,
    fim.invocations_table_name,
    fim.execution_logs_table_name,
    fim.scope
  FROM metaschema_modules_public.function_invocation_module fim
  JOIN metaschema_public.schema s ON fim.schema_id = s.id
  WHERE fim.database_id = $1
`;

const COMPUTE_LOG_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    clm.compute_log_table_name,
    clm.usage_daily_table_name,
    clm.scope
  FROM metaschema_modules_public.compute_log_module clm
  JOIN metaschema_public.schema s  ON clm.schema_id = s.id
  JOIN metaschema_public.schema ps ON clm.private_schema_id = ps.id
  WHERE clm.database_id = $1
`;

export class ComputeModuleLoader {
  private cache: TtlCache<ComputeModuleConfig>;
  private pool: Pool;

  constructor(pool: Pool, ttlMs = 60_000) {
    this.pool = pool;
    this.cache = new TtlCache<ComputeModuleConfig>(ttlMs);
  }

  async load(databaseId: string): Promise<ComputeModuleConfig> {
    const cached = this.cache.get(databaseId);
    if (cached !== undefined) {
      log.debug(`module config cache hit for database ${databaseId}`);
      return cached;
    }

    log.debug(`module config cache miss for database ${databaseId}, querying metaschema`);

    const fnResult = await this.pool.query(FUNCTION_MODULE_SQL, [databaseId]);

    let functionModule: FunctionModuleConfig | null = null;
    if (fnResult.rows.length > 0) {
      const row = fnResult.rows[0];
      functionModule = {
        publicSchema: row.public_schema,
        privateSchema: row.private_schema,
        definitionsTable: row.definitions_table_name,
        secretDefinitionsTable: row.secret_definitions_table_name,
        scope: row.scope,
      };
    }

    // Invocation module is optional — the table may not be deployed yet
    let invocationModules: InvocationModuleConfig[] = [];
    try {
      const invResult = await this.pool.query(INVOCATION_MODULE_SQL, [databaseId]);
      invocationModules = invResult.rows.map(
        (row: Record<string, string>) => ({
          publicSchema: row.public_schema,
          invocationsTable: row.invocations_table_name,
          executionLogsTable: row.execution_logs_table_name,
          scope: row.scope,
        })
      );
    } catch {
      log.debug(`function_invocation_module not available for database ${databaseId} — invocation tracking disabled`);
    }

    // Compute log module is optional — only present when usage tracking is provisioned
    let computeLogModule: ComputeLogModuleConfig | null = null;
    try {
      const clResult = await this.pool.query(COMPUTE_LOG_MODULE_SQL, [databaseId]);
      if (clResult.rows.length > 0) {
        const row = clResult.rows[0];
        computeLogModule = {
          publicSchema: row.public_schema,
          privateSchema: row.private_schema,
          computeLogTable: row.compute_log_table_name,
          usageDailyTable: row.usage_daily_table_name,
          scope: row.scope,
        };
      }
    } catch {
      log.debug(`compute_log_module not available for database ${databaseId} — usage logging disabled`);
    }

    const config: ComputeModuleConfig = { functionModule, invocationModules, computeLogModule };
    this.cache.set(databaseId, config);

    log.info(
      `loaded compute module config for database ${databaseId}: ` +
        `fn=${functionModule ? `${functionModule.publicSchema}.${functionModule.definitionsTable}` : 'none'}, ` +
        `invocations=${invocationModules.length} scope(s), ` +
        `computeLog=${computeLogModule ? `${computeLogModule.publicSchema}.${computeLogModule.computeLogTable}` : 'none'}`
    );

    return config;
  }

  invalidate(databaseId: string): void {
    this.cache.delete(databaseId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
