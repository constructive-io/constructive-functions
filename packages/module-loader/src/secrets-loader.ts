/**
 * SecretsLoader -- resolves config_secrets_module schema/table names
 * from MetaSchema, then queries the resolved secrets table for name+namespace
 * matches.
 *
 * Used by the compute worker to dynamically inject secrets into a function's
 * env before dispatch.
 *
 * Multi-database: pass different databaseId to resolve secrets for
 * platform scope vs tenant scope.
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
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    csm.secrets_table_name,
    csm.scope
  FROM metaschema_modules_public.config_secrets_module csm
  JOIN metaschema_public.schema s  ON csm.schema_id = s.id
  JOIN metaschema_public.schema ps ON csm.private_schema_id = ps.id
  WHERE csm.database_id = $1
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
        publicSchema: rows[0].public_schema,
        privateSchema: rows[0].private_schema,
        secretsTable: rows[0].secrets_table_name,
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
   * Resolve secrets by name for a given namespace.
   * Returns an array of { name, value } pairs for all matching secret names.
   * Missing secrets are silently skipped (callers decide if that's an error).
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

    try {
      const sql = namespaceName
        ? `SELECT name, decrypted_value AS value
           FROM "${config.privateSchema}"."${config.secretsTable}"
           WHERE name = ANY($1) AND namespace_name = $2`
        : `SELECT name, decrypted_value AS value
           FROM "${config.privateSchema}"."${config.secretsTable}"
           WHERE name = ANY($1) AND namespace_name IS NULL`;

      const params: unknown[] = [secretNames];
      if (namespaceName) params.push(namespaceName);

      const { rows } = await this.pool.query(sql, params);
      log.debug(`resolved ${rows.length}/${secretNames.length} secrets for namespace=${namespaceName ?? '(global)'}`);
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
