/**
 * ComputeModuleLoader — resolves compute module schema/table names
 * dynamically from MetaSchema.
 *
 * Queries metaschema_modules_public.function_module,
 * metaschema_modules_public.function_invocation_module, and
 * metaschema_modules_public.compute_log_module, joined with
 * metaschema_public.schema to resolve schema names.
 *
 * Results are TTL-cached per database_id for multi-tenant support.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type {
  ComputeLogModuleConfig,
  ComputeModuleConfig,
  FunctionModuleConfig,
  GraphExecutionModuleConfig,
  InvocationModuleConfig,
} from './types';
import { DEFAULT_TTL_MS } from './types';

const log = new Logger('module-loader:compute');

// ─── SQL Queries ─────────────────────────────────────────────────────────────

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

const GRAPH_EXECUTION_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    gem.node_states_table_name,
    gem.complete_node_function,
    gem.fail_node_function
  FROM metaschema_modules_public.graph_execution_module gem
  JOIN metaschema_public.schema s  ON gem.schema_id = s.id
  JOIN metaschema_public.schema ps ON gem.private_schema_id = ps.id
  WHERE gem.database_id = $1
`;

// ─── Default Configs ─────────────────────────────────────────────────────────

const DEFAULT_GRAPH_EXECUTION: GraphExecutionModuleConfig = {
  publicSchema: 'constructive_compute_public',
  privateSchema: 'constructive_compute_private',
  nodeStatesTable: 'platform_function_graph_execution_node_states',
  completeNodeFunction: 'platform_complete_node',
  failNodeFunction: 'platform_fail_node',
};

// ─── Loader Class ────────────────────────────────────────────────────────────

export interface ComputeModuleConfigExtended extends ComputeModuleConfig {
  graphExecutionModule: GraphExecutionModuleConfig;
}

export class ComputeModuleLoader {
  private cache: TtlCache<ComputeModuleConfigExtended>;
  private pool: Pool;

  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    this.pool = pool;
    this.cache = new TtlCache<ComputeModuleConfigExtended>(ttlMs);
  }

  /**
   * Load the full compute module config for a database.
   * Cached per database_id. Safe for multi-tenant usage:
   * - `load(platformId)` → platform scope
   * - `load(tenantId)` → tenant scope
   */
  async load(databaseId: string): Promise<ComputeModuleConfigExtended> {
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
      log.debug(`function_invocation_module not available for database ${databaseId}`);
    }

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
      log.debug(`compute_log_module not available for database ${databaseId}`);
    }

    let graphExecutionModule: GraphExecutionModuleConfig = DEFAULT_GRAPH_EXECUTION;
    try {
      const geResult = await this.pool.query(GRAPH_EXECUTION_MODULE_SQL, [databaseId]);
      if (geResult.rows.length > 0) {
        const row = geResult.rows[0];
        graphExecutionModule = {
          publicSchema: row.public_schema,
          privateSchema: row.private_schema,
          nodeStatesTable: row.node_states_table_name,
          completeNodeFunction: row.complete_node_function,
          failNodeFunction: row.fail_node_function,
        };
      }
    } catch {
      log.debug(`graph_execution_module not available for database ${databaseId} — using defaults`);
    }

    const config: ComputeModuleConfigExtended = {
      functionModule,
      invocationModules,
      computeLogModule,
      graphExecutionModule,
    };
    this.cache.set(databaseId, config);

    log.info(
      `loaded compute module config for database ${databaseId}: ` +
        `fn=${functionModule ? `${functionModule.publicSchema}.${functionModule.definitionsTable}` : 'none'}, ` +
        `invocations=${invocationModules.length} scope(s), ` +
        `computeLog=${computeLogModule ? `${computeLogModule.publicSchema}.${computeLogModule.computeLogTable}` : 'none'}, ` +
        `graph=${graphExecutionModule.publicSchema}.${graphExecutionModule.nodeStatesTable}`
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
