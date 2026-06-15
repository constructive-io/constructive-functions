/**
 * NamespaceModuleLoader — resolves namespace schema/table names from
 * metaschema_modules_public.namespace_module.
 *
 * Discovers where platform_namespaces (and namespace events) live
 * for a given database_id + scope.
 */

import type { Pool } from 'pg';

import { ModuleConfigLoader } from './generic-loader';
import type { ScopedModuleConfig } from './generic-loader';
import { DEFAULT_TTL_MS } from './types';

// ─── Config Type ─────────────────────────────────────────────────────────────

export interface NamespaceModuleConfig extends ScopedModuleConfig {
  publicSchema: string;
  privateSchema: string;
  namespacesTable: string;
  namespaceEventsTable: string;
}

// ─── SQL ─────────────────────────────────────────────────────────────────────

const NAMESPACE_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    nm.namespaces_table_name,
    nm.namespace_events_table_name,
    nm.scope
  FROM metaschema_modules_public.namespace_module nm
  JOIN metaschema_public.schema s  ON nm.schema_id = s.id
  JOIN metaschema_public.schema ps ON nm.private_schema_id = ps.id
  WHERE nm.database_id = $1
`;

// ─── Row Mapper ──────────────────────────────────────────────────────────────

function mapNamespaceRow(row: Record<string, string>): NamespaceModuleConfig {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    namespacesTable: row.namespaces_table_name,
    namespaceEventsTable: row.namespace_events_table_name,
    scope: row.scope,
  };
}

// ─── Loader ──────────────────────────────────────────────────────────────────

export class NamespaceModuleLoader extends ModuleConfigLoader<NamespaceModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'namespace', NAMESPACE_MODULE_SQL, mapNamespaceRow, ttlMs);
  }
}
