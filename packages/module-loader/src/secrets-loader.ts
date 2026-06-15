/**
 * SecretsLoader -- resolves config_secrets_module schema/table names
 * from MetaSchema, then queries the resolved secrets table for name+namespace
 * matches.
 *
 * Secrets are PGP-encrypted (bytea column `value`). Decryption uses
 * pgp_sym_decrypt(value, key_id::text) where key_id is the per-secret
 * encryption key stored alongside each row.
 *
 * Resolution flow:
 *   1. Query config_secrets_module for table_id → resolve via schema_and_table()
 *   2. If namespace_name provided: resolve to namespace UUID via namespace_module
 *   3. Query secrets table: WHERE namespace_id = $ns_uuid AND name = ANY($names)
 *   4. Decrypt via pgp_sym_decrypt(value, key_id::text)
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { ConfigSecretsModuleConfig, ResolvedSecret } from './types';
import { DEFAULT_DATABASE_ID, DEFAULT_TTL_MS } from './types';

const log = new Logger('module-loader:secrets');

// ─── MetaSchema Resolution ────────────────────────────────────────────────────

const CONFIG_SECRETS_MODULE_SQL = `
  SELECT
    st.schema_name AS secrets_schema,
    st.table_name  AS secrets_table,
    csm.scope
  FROM metaschema_modules_public.config_secrets_module csm
  CROSS JOIN LATERAL metaschema.schema_and_table(csm.table_id) st
  WHERE csm.database_id = $1
  ORDER BY csm.scope ASC
  LIMIT 1
`;

const NAMESPACE_MODULE_SQL = `
  SELECT
    st.schema_name AS ns_schema,
    st.table_name  AS ns_table
  FROM metaschema_modules_public.namespace_module nm
  CROSS JOIN LATERAL metaschema.schema_and_table(nm.namespaces_table_id) st
  WHERE nm.database_id = $1
  LIMIT 1
`;

// ─── SecretsLoader Class ──────────────────────────────────────────────────────

export class SecretsLoader {
  private pool: Pool;
  private cache: TtlCache<ConfigSecretsModuleConfig | null>;
  private defaultDatabaseId: string;

  constructor(pool: Pool, databaseId: string = DEFAULT_DATABASE_ID, ttlMs: number = DEFAULT_TTL_MS) {
    this.pool = pool;
    this.defaultDatabaseId = databaseId;
    this.cache = new TtlCache<ConfigSecretsModuleConfig | null>(ttlMs);
  }

  /**
   * Load config_secrets_module config for a database.
   * Returns null if the module is not provisioned.
   */
  async load(databaseId?: string): Promise<ConfigSecretsModuleConfig | null> {
    const dbId = databaseId ?? this.defaultDatabaseId;
    const cached = this.cache.get(dbId);
    if (cached !== undefined) return cached;

    try {
      const { rows } = await this.pool.query(CONFIG_SECRETS_MODULE_SQL, [dbId]);
      if (!rows.length) {
        this.cache.set(dbId, null);
        return null;
      }
      const config: ConfigSecretsModuleConfig = {
        publicSchema: rows[0].secrets_schema,
        privateSchema: rows[0].secrets_schema,
        secretsTable: rows[0].secrets_table,
        scope: rows[0].scope,
      };
      log.debug(`loaded config_secrets_module: ${config.privateSchema}.${config.secretsTable}`);
      this.cache.set(dbId, config);
      return config;
    } catch {
      log.debug(`config_secrets_module not available for database ${dbId}`);
      this.cache.set(dbId, null);
      return null;
    }
  }

  /**
   * Resolve namespace_name → namespace UUID via the namespace_module table.
   * Returns null if namespace not found or namespace_module not provisioned.
   */
  private async resolveNamespaceId(
    namespaceName: string,
    databaseId: string
  ): Promise<string | null> {
    try {
      const { rows: nsModRows } = await this.pool.query(NAMESPACE_MODULE_SQL, [databaseId]);
      if (!nsModRows.length) return null;

      const { ns_schema, ns_table } = nsModRows[0];
      const { rows } = await this.pool.query(
        `SELECT id FROM "${ns_schema}"."${ns_table}" WHERE name = $1 LIMIT 1`,
        [namespaceName]
      );
      return rows[0]?.id ?? null;
    } catch {
      log.debug(`namespace resolution failed for "${namespaceName}"`);
      return null;
    }
  }

  /**
   * Resolve secrets by name for a given namespace.
   *
   * Flow:
   *   1. Load config_secrets_module config (schema + table names)
   *   2. If namespaceName provided, resolve it to a UUID via namespace table
   *   3. Query secrets table by namespace_id + name, decrypt values
   *
   * Returns { name, value } pairs. Missing secrets are silently skipped.
   */
  async resolveSecrets(
    secretNames: string[],
    namespaceName: string | undefined,
    databaseId?: string
  ): Promise<ResolvedSecret[]> {
    if (secretNames.length === 0) return [];

    const config = await this.load(databaseId);
    if (!config) {
      log.debug('config_secrets_module not provisioned — returning empty secrets');
      return [];
    }

    const dbId = databaseId ?? this.defaultDatabaseId;

    try {
      let namespaceId: string | null = null;
      if (namespaceName) {
        namespaceId = await this.resolveNamespaceId(namespaceName, dbId);
        if (!namespaceId) {
          log.warn(`namespace "${namespaceName}" not found — cannot resolve secrets`);
          return [];
        }
      }

      const sql = namespaceId
        ? `SELECT name, pgp_sym_decrypt(value, key_id::text) AS value
           FROM "${config.privateSchema}"."${config.secretsTable}"
           WHERE name = ANY($1) AND namespace_id = $2`
        : `SELECT name, pgp_sym_decrypt(value, key_id::text) AS value
           FROM "${config.privateSchema}"."${config.secretsTable}"
           WHERE name = ANY($1)`;

      const params: unknown[] = [secretNames];
      if (namespaceId) params.push(namespaceId);

      const { rows } = await this.pool.query(sql, params);
      log.debug(`resolved ${rows.length}/${secretNames.length} secrets for namespace=${namespaceName ?? '(default)'}`);
      return rows as ResolvedSecret[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`secret resolution failed (non-fatal): ${msg}`);
      return [];
    }
  }

  invalidate(databaseId?: string): void {
    if (databaseId) {
      this.cache.delete(databaseId);
    } else {
      this.cache.clear();
    }
  }
}
