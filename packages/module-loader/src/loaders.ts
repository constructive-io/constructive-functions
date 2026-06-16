import type { Queryable } from './generic-loader';
import { ModuleConfigLoader } from './generic-loader';

// ─── Config Types ────────────────────────────────────────────────────────────

export interface FunctionModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  definitionsTable: string;
  secretDefinitionsTable: string;
}

export interface NamespaceModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  namespacesTable: string;
  namespaceEventsTable: string;
}

export interface SecretsModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  secretsTable: string;
}

export interface StorageModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  bucketsTable: string;
  filesTable: string;
}

export interface InvocationModuleConfig {
  scope: string;
  publicSchema: string;
  invocationsTable: string;
  executionLogsTable: string;
}

export interface ComputeLogModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  computeLogTable: string;
  usageDailyTable: string;
}

export interface GraphModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  nodeStatesTable: string;
  executionsTable: string;
  outputsTable: string;
  completeNodeFunction: string;
  failNodeFunction: string;
}

export interface BillingModuleConfig {
  scope: string;
  publicSchema: string;
  privateSchema: string;
  recordUsageFunction: string;
}

// ─── SQL Queries ─────────────────────────────────────────────────────────────

const FUNCTION_MODULE_SQL = `
  SELECT
    fm.scope,
    fm.definitions_table_name,
    fm.secret_definitions_table_name,
    COALESCE(fm.public_schema_name, ps.schema_name) AS public_schema,
    COALESCE(fm.private_schema_name, pvs.schema_name) AS private_schema
  FROM metaschema_modules_public.function_module fm
  LEFT JOIN metaschema_public.schema ps ON ps.id = fm.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = fm.private_schema_id
  WHERE fm.database_id = $1
`;

const NAMESPACE_MODULE_SQL = `
  SELECT
    nm.scope,
    nm.namespaces_table_name,
    nm.namespace_events_table_name,
    COALESCE(nm.public_schema_name, ps.schema_name) AS public_schema,
    COALESCE(nm.private_schema_name, pvs.schema_name) AS private_schema
  FROM metaschema_modules_public.namespace_module nm
  LEFT JOIN metaschema_public.schema ps ON ps.id = nm.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = nm.private_schema_id
  WHERE nm.database_id = $1
`;

const SECRETS_MODULE_SQL = `
  SELECT
    sm.scope,
    sm.table_name AS secrets_table_name,
    ps.schema_name AS public_schema,
    pvs.schema_name AS private_schema
  FROM metaschema_modules_public.config_secrets_module sm
  LEFT JOIN metaschema_public.schema ps ON ps.id = sm.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = sm.private_schema_id
  WHERE sm.database_id = $1
`;

const STORAGE_MODULE_SQL = `
  SELECT
    sm.scope,
    sm.buckets_table_name,
    sm.files_table_name,
    ps.schema_name AS public_schema,
    pvs.schema_name AS private_schema
  FROM metaschema_modules_public.storage_module sm
  LEFT JOIN metaschema_public.schema ps ON ps.id = sm.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = sm.private_schema_id
  WHERE sm.database_id = $1
`;

const INVOCATION_MODULE_SQL = `
  SELECT
    im.scope,
    im.invocations_table_name,
    im.execution_logs_table_name,
    COALESCE(im.public_schema_name, ps.schema_name) AS public_schema
  FROM metaschema_modules_public.function_invocation_module im
  LEFT JOIN metaschema_public.schema ps ON ps.id = im.schema_id
  WHERE im.database_id = $1
`;

const COMPUTE_LOG_MODULE_SQL = `
  SELECT
    clm.scope,
    clm.compute_log_table_name,
    clm.usage_daily_table_name,
    ps.schema_name AS public_schema,
    pvs.schema_name AS private_schema
  FROM metaschema_modules_public.compute_log_module clm
  LEFT JOIN metaschema_public.schema ps ON ps.id = clm.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = clm.private_schema_id
  WHERE clm.database_id = $1
`;

const GRAPH_MODULE_SQL = `
  SELECT
    gem.scope,
    gem.prefix,
    gem.node_states_table_name,
    gem.executions_table_name,
    gem.outputs_table_name,
    COALESCE(gem.public_schema_name, ps.schema_name) AS public_schema,
    COALESCE(gem.private_schema_name, pvs.schema_name) AS private_schema
  FROM metaschema_modules_public.graph_execution_module gem
  LEFT JOIN metaschema_public.schema ps ON ps.id = gem.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = gem.private_schema_id
  WHERE gem.database_id = $1
`;

const BILLING_MODULE_SQL = `
  SELECT
    bm.scope,
    ps.schema_name AS public_schema,
    pvs.schema_name AS private_schema,
    bm.record_usage_function
  FROM metaschema_modules_public.billing_module bm
  LEFT JOIN metaschema_public.schema ps ON ps.id = bm.schema_id
  LEFT JOIN metaschema_public.schema pvs ON pvs.id = bm.private_schema_id
  WHERE bm.database_id = $1
`;

// ─── Loader Factories ────────────────────────────────────────────────────────

export function createFunctionLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<FunctionModuleConfig>({
    pool,
    sql: FUNCTION_MODULE_SQL,
    moduleName: 'function_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      definitionsTable: row.definitions_table_name as string,
      secretDefinitionsTable: row.secret_definitions_table_name as string,
    }),
  });
}

export function createNamespaceLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<NamespaceModuleConfig>({
    pool,
    sql: NAMESPACE_MODULE_SQL,
    moduleName: 'namespace_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      namespacesTable: row.namespaces_table_name as string,
      namespaceEventsTable: row.namespace_events_table_name as string,
    }),
  });
}

export function createSecretsLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<SecretsModuleConfig>({
    pool,
    sql: SECRETS_MODULE_SQL,
    moduleName: 'config_secrets_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      secretsTable: row.secrets_table_name as string,
    }),
  });
}

export function createStorageLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<StorageModuleConfig>({
    pool,
    sql: STORAGE_MODULE_SQL,
    moduleName: 'storage_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      bucketsTable: row.buckets_table_name as string,
      filesTable: row.files_table_name as string,
    }),
  });
}

export function createInvocationLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<InvocationModuleConfig>({
    pool,
    sql: INVOCATION_MODULE_SQL,
    moduleName: 'function_invocation_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      invocationsTable: row.invocations_table_name as string,
      executionLogsTable: row.execution_logs_table_name as string,
    }),
  });
}

export function createComputeLogLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<ComputeLogModuleConfig>({
    pool,
    sql: COMPUTE_LOG_MODULE_SQL,
    moduleName: 'compute_log_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      computeLogTable: row.compute_log_table_name as string,
      usageDailyTable: row.usage_daily_table_name as string,
    }),
  });
}

export function createGraphLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<GraphModuleConfig>({
    pool,
    sql: GRAPH_MODULE_SQL,
    moduleName: 'graph_execution_module',
    ttlMs,
    mapper: (row) => {
      const prefix = (row.prefix as string) || 'platform';
      return {
        scope: row.scope as string,
        publicSchema: row.public_schema as string,
        privateSchema: row.private_schema as string,
        nodeStatesTable: row.node_states_table_name as string,
        executionsTable: row.executions_table_name as string,
        outputsTable: row.outputs_table_name as string,
        completeNodeFunction: `${prefix}_complete_node`,
        failNodeFunction: `${prefix}_fail_node`,
      };
    },
  });
}

export function createBillingLoader(pool: Queryable, ttlMs?: number) {
  return new ModuleConfigLoader<BillingModuleConfig>({
    pool,
    sql: BILLING_MODULE_SQL,
    moduleName: 'billing_module',
    ttlMs,
    mapper: (row) => ({
      scope: row.scope as string,
      publicSchema: row.public_schema as string,
      privateSchema: row.private_schema as string,
      recordUsageFunction: row.record_usage_function as string,
    }),
  });
}
