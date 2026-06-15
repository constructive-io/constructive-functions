/**
 * SecretsModuleLoader — resolves secrets schema/table names from
 * metaschema_modules_public.config_secrets_module.
 *
 * Discovers where platform_secrets live for a given database_id + scope.
 */

import type { Pool } from 'pg';

import { ModuleConfigLoader } from './generic-loader';
import type { ScopedModuleConfig } from './generic-loader';
import { DEFAULT_TTL_MS } from './types';

// ─── Config Type ─────────────────────────────────────────────────────────────

export interface SecretsModuleConfig extends ScopedModuleConfig {
  publicSchema: string;
  privateSchema: string;
  secretsTable: string;
}

// ─── SQL ─────────────────────────────────────────────────────────────────────

const SECRETS_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    csm.table_name AS secrets_table_name,
    csm.scope
  FROM metaschema_modules_public.config_secrets_module csm
  JOIN metaschema_public.schema s  ON csm.schema_id = s.id
  JOIN metaschema_public.schema ps ON csm.private_schema_id = ps.id
  WHERE csm.database_id = $1
`;

// ─── Row Mapper ──────────────────────────────────────────────────────────────

function mapSecretsRow(row: Record<string, string>): SecretsModuleConfig {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    secretsTable: row.secrets_table_name,
    scope: row.scope,
  };
}

// ─── Loader ──────────────────────────────────────────────────────────────────

export class SecretsModuleLoader extends ModuleConfigLoader<SecretsModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'secrets', SECRETS_MODULE_SQL, mapSecretsRow, ttlMs);
  }
}
