/**
 * ComputeModuleLoader — resolves compute module schema/table names
 * dynamically from MetaSchema.
 *
 * Composes four sub-loaders using the generic ModuleConfigLoader base:
 *   - FunctionModuleLoader (function_module)
 *   - InvocationModuleLoader (function_invocation_module)
 *   - ComputeLogModuleLoader (compute_log_module)
 *   - GraphExecutionModuleLoader (graph_execution_module)
 *
 * Results are TTL-cached per database_id for multi-tenant support.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { ModuleConfigLoader } from './generic-loader';
import type { ScopedModuleConfig } from './generic-loader';
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
    gem.fail_node_function,
    gem.scope
  FROM metaschema_modules_public.graph_execution_module gem
  JOIN metaschema_public.schema s  ON gem.schema_id = s.id
  JOIN metaschema_public.schema ps ON gem.private_schema_id = ps.id
  WHERE gem.database_id = $1
`;

// ─── Row Mappers ─────────────────────────────────────────────────────────────

function mapFunctionRow(row: Record<string, string>): FunctionModuleConfig {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    definitionsTable: row.definitions_table_name,
    secretDefinitionsTable: row.secret_definitions_table_name,
    scope: row.scope,
  };
}

function mapInvocationRow(row: Record<string, string>): InvocationModuleConfig {
  return {
    publicSchema: row.public_schema,
    invocationsTable: row.invocations_table_name,
    executionLogsTable: row.execution_logs_table_name,
    scope: row.scope,
  };
}

function mapComputeLogRow(row: Record<string, string>): ComputeLogModuleConfig {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    computeLogTable: row.compute_log_table_name,
    usageDailyTable: row.usage_daily_table_name,
    scope: row.scope,
  };
}

function mapGraphExecutionRow(row: Record<string, string>): GraphExecutionModuleConfig & ScopedModuleConfig {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    nodeStatesTable: row.node_states_table_name,
    completeNodeFunction: row.complete_node_function,
    failNodeFunction: row.fail_node_function,
    scope: row.scope,
  };
}

// ─── Default Configs ─────────────────────────────────────────────────────────

const DEFAULT_GRAPH_EXECUTION: GraphExecutionModuleConfig = {
  publicSchema: 'constructive_compute_public',
  privateSchema: 'constructive_compute_private',
  nodeStatesTable: 'platform_function_graph_execution_node_states',
  completeNodeFunction: 'platform_complete_node',
  failNodeFunction: 'platform_fail_node',
};

// ─── Sub-Loaders (exposed for direct scope-aware access) ─────────────────────

export class FunctionModuleLoader extends ModuleConfigLoader<FunctionModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'function', FUNCTION_MODULE_SQL, mapFunctionRow, ttlMs);
  }
}

export class InvocationModuleLoader extends ModuleConfigLoader<InvocationModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'invocation', INVOCATION_MODULE_SQL, mapInvocationRow, ttlMs);
  }
}

export class ComputeLogModuleLoader extends ModuleConfigLoader<ComputeLogModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'compute-log', COMPUTE_LOG_MODULE_SQL, mapComputeLogRow, ttlMs);
  }
}

export class GraphExecutionModuleLoader extends ModuleConfigLoader<GraphExecutionModuleConfig & ScopedModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'graph-execution', GRAPH_EXECUTION_MODULE_SQL, mapGraphExecutionRow, ttlMs);
  }
}

// ─── Composite Loader (backwards-compatible facade) ──────────────────────────

export interface ComputeModuleConfigExtended extends ComputeModuleConfig {
  graphExecutionModule: GraphExecutionModuleConfig;
}

export class ComputeModuleLoader {
  readonly function: FunctionModuleLoader;
  readonly invocation: InvocationModuleLoader;
  readonly computeLog: ComputeLogModuleLoader;
  readonly graphExecution: GraphExecutionModuleLoader;

  private compositeCache: TtlCache<ComputeModuleConfigExtended>;

  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    this.function = new FunctionModuleLoader(pool, ttlMs);
    this.invocation = new InvocationModuleLoader(pool, ttlMs);
    this.computeLog = new ComputeLogModuleLoader(pool, ttlMs);
    this.graphExecution = new GraphExecutionModuleLoader(pool, ttlMs);
    this.compositeCache = new TtlCache<ComputeModuleConfigExtended>(ttlMs);
  }

  /**
   * Load the full composite compute config for a database.
   * Backwards-compatible with existing callers.
   */
  async load(databaseId: string): Promise<ComputeModuleConfigExtended> {
    const cached = this.compositeCache.get(databaseId);
    if (cached !== undefined) {
      log.debug(`composite cache hit for database ${databaseId}`);
      return cached;
    }

    log.debug(`composite cache miss for database ${databaseId}, loading sub-modules`);

    const [fnConfigs, invConfigs, clConfigs, geConfigs] = await Promise.all([
      this.function.loadAll(databaseId),
      this.invocation.loadAll(databaseId),
      this.computeLog.loadAll(databaseId),
      this.graphExecution.loadAll(databaseId),
    ]);

    const config: ComputeModuleConfigExtended = {
      functionModule: fnConfigs[0] ?? null,
      invocationModules: invConfigs,
      computeLogModule: clConfigs[0] ?? null,
      graphExecutionModule: geConfigs[0] ?? DEFAULT_GRAPH_EXECUTION,
    };

    this.compositeCache.set(databaseId, config);

    log.info(
      `loaded compute module config for database ${databaseId}: ` +
        `fn=${config.functionModule ? `${config.functionModule.publicSchema}.${config.functionModule.definitionsTable}` : 'none'}, ` +
        `invocations=${invConfigs.length} scope(s), ` +
        `computeLog=${config.computeLogModule ? `${config.computeLogModule.publicSchema}.${config.computeLogModule.computeLogTable}` : 'none'}, ` +
        `graph=${config.graphExecutionModule.publicSchema}.${config.graphExecutionModule.nodeStatesTable}`
    );

    return config;
  }

  invalidate(databaseId: string): void {
    this.compositeCache.delete(databaseId);
    this.function.invalidate(databaseId);
    this.invocation.invalidate(databaseId);
    this.computeLog.invalidate(databaseId);
    this.graphExecution.invalidate(databaseId);
  }

  invalidateAll(): void {
    this.compositeCache.clear();
    this.function.invalidate();
    this.invocation.invalidate();
    this.computeLog.invalidate();
    this.graphExecution.invalidate();
  }
}
