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
