/**
 * ComputeModuleLoader — resolves compute module config from metaschema.
 *
 * Instead of hardcoding schema names (e.g. "constructive_infra_public"),
 * this loader queries metaschema_modules_public to dynamically resolve
 * schemas and table names for function definitions and invocations.
 *
 * Results are cached per database_id with a configurable TTL (default 60s).
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { ComputeModuleConfig } from './types';

const log = new Logger('compute:module-loader');

// ─── SQL ─────────────────────────────────────────────────────────────────────

const FUNCTION_MODULE_SQL = `
  SELECT
    s.schema_name AS public_schema,
    ps.schema_name AS private_schema,
    fm.definitions_table_name,
    fm.secret_definitions_table_name,
    fm.scope
  FROM metaschema_modules_public.function_module fm
  JOIN metaschema_public.schema s ON fm.schema_id = s.id
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

// ─── Row Types ───────────────────────────────────────────────────────────────

interface FunctionModuleRow {
  public_schema: string;
  private_schema: string;
  definitions_table_name: string;
  secret_definitions_table_name: string;
  scope: string;
}

interface InvocationModuleRow {
  public_schema: string;
  invocations_table_name: string;
  execution_logs_table_name: string;
  scope: string;
}

// ─── Loader ──────────────────────────────────────────────────────────────────

const DEFAULT_TTL_MS = 60_000;

export class ComputeModuleLoader {
  private cache: TtlCache<ComputeModuleConfig>;
  private pool: Pool;

  constructor(pool: Pool, ttlMs = DEFAULT_TTL_MS) {
    this.pool = pool;
    this.cache = new TtlCache<ComputeModuleConfig>(ttlMs);
  }

  /**
   * Resolve compute module config for a given database_id.
   * Returns cached config on hit; queries metaschema on miss.
   */
  async resolve(databaseId: string): Promise<ComputeModuleConfig> {
    const cached = this.cache.get(databaseId);
    if (cached !== undefined) {
      log.debug(`cache hit: ${databaseId}`);
      return cached;
    }

    log.debug(`cache miss: ${databaseId}, querying metaschema`);
    const config = await this.fetch(databaseId);
    this.cache.set(databaseId, config);
    return config;
  }

  /** Invalidate cached config for a specific database. */
  invalidate(databaseId: string): void {
    this.cache.delete(databaseId);
  }

  /** Clear the entire cache. */
  invalidateAll(): void {
    this.cache.clear();
  }

  get cacheSize(): number {
    return this.cache.size;
  }

  // ─── Internal ────────────────────────────────────────────────────────

  private async fetch(databaseId: string): Promise<ComputeModuleConfig> {
    let functionModule: ComputeModuleConfig['functionModule'] = null;
    let invocationModules: ComputeModuleConfig['invocationModules'] = [];

    try {
      const { rows } = await this.pool.query<FunctionModuleRow>(
        FUNCTION_MODULE_SQL,
        [databaseId],
      );
      const row = rows[0];
      if (row) {
        functionModule = {
          publicSchema: row.public_schema,
          privateSchema: row.private_schema,
          definitionsTable: row.definitions_table_name,
          secretDefinitionsTable: row.secret_definitions_table_name,
          scope: row.scope,
        };
        log.info(
          `resolved function_module: ${row.public_schema}.${row.definitions_table_name} (scope=${row.scope})`,
        );
      } else {
        log.warn(`no function_module for database_id=${databaseId}`);
      }
    } catch (err: any) {
      log.error(`failed to query function_module for ${databaseId}: ${err.message}`);
    }

    try {
      const { rows } = await this.pool.query<InvocationModuleRow>(
        INVOCATION_MODULE_SQL,
        [databaseId],
      );
      invocationModules = rows.map((row) => ({
        publicSchema: row.public_schema,
        invocationsTable: row.invocations_table_name,
        executionLogsTable: row.execution_logs_table_name,
        scope: row.scope,
      }));
      if (invocationModules.length > 0) {
        log.info(
          `resolved ${invocationModules.length} invocation_module(s) for database_id=${databaseId}: ` +
            invocationModules.map((m) => `${m.publicSchema}.${m.invocationsTable} (scope=${m.scope})`).join(', '),
        );
      } else {
        log.warn(`no invocation_modules for database_id=${databaseId}`);
      }
    } catch (err: any) {
      log.error(`failed to query invocation_modules for ${databaseId}: ${err.message}`);
    }

    return { functionModule, invocationModules };
  }
}
