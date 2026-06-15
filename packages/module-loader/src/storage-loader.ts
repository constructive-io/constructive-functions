/**
 * StorageModuleLoader — resolves storage schema/table names from
 * metaschema_modules_public.storage_module.
 *
 * Discovers where buckets + files tables live for a given database_id + scope.
 */

import type { Pool } from 'pg';

import { ModuleConfigLoader } from './generic-loader';
import type { ScopedModuleConfig } from './generic-loader';
import { DEFAULT_TTL_MS } from './types';

// ─── Config Type ─────────────────────────────────────────────────────────────

export interface StorageModuleConfig extends ScopedModuleConfig {
  publicSchema: string;
  privateSchema: string;
  bucketsTable: string;
  filesTable: string;
}

// ─── SQL ─────────────────────────────────────────────────────────────────────

const STORAGE_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    sm.buckets_table_name,
    sm.files_table_name,
    sm.scope
  FROM metaschema_modules_public.storage_module sm
  JOIN metaschema_public.schema s  ON sm.schema_id = s.id
  JOIN metaschema_public.schema ps ON sm.private_schema_id = ps.id
  WHERE sm.database_id = $1
`;

// ─── Row Mapper ──────────────────────────────────────────────────────────────

function mapStorageRow(row: Record<string, string>): StorageModuleConfig {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    bucketsTable: row.buckets_table_name,
    filesTable: row.files_table_name,
    scope: row.scope,
  };
}

// ─── Loader ──────────────────────────────────────────────────────────────────

export class StorageModuleLoader extends ModuleConfigLoader<StorageModuleConfig> {
  constructor(pool: Pool, ttlMs: number = DEFAULT_TTL_MS) {
    super(pool, 'storage', STORAGE_MODULE_SQL, mapStorageRow, ttlMs);
  }
}
