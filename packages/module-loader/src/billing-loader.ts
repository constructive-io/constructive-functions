/**
 * BillingLoader — quota checks and usage recording via the billing_module.
 *
 * Built on the generic ModuleConfigLoader base for consistent caching
 * and scope resolution. Gracefully no-ops when billing is not provisioned.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { ModuleConfigLoader } from './generic-loader';
import type { ScopedModuleConfig } from './generic-loader';
import type { BillingModuleConfig } from './types';
import { DEFAULT_DATABASE_ID, DEFAULT_TTL_MS } from './types';

const log = new Logger('module-loader:billing');

// ─── Extended Config (includes scope) ────────────────────────────────────────

interface BillingModuleConfigScoped extends BillingModuleConfig, ScopedModuleConfig {}

// ─── SQL ─────────────────────────────────────────────────────────────────────

const BILLING_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    bm.record_usage_function,
    bm.scope
  FROM metaschema_modules_public.billing_module bm
  JOIN metaschema_public.schema s  ON bm.schema_id = s.id
  JOIN metaschema_public.schema ps ON bm.private_schema_id = ps.id
  WHERE bm.database_id = $1
`;

// ─── Row Mapper ──────────────────────────────────────────────────────────────

function mapBillingRow(row: Record<string, string>): BillingModuleConfigScoped {
  return {
    publicSchema: row.public_schema,
    privateSchema: row.private_schema,
    recordUsageFunction: row.record_usage_function,
    scope: row.scope,
  };
}

// ─── Loader ──────────────────────────────────────────────────────────────────

export class BillingLoader {
  private loader: ModuleConfigLoader<BillingModuleConfigScoped>;
  private pool: Pool;
  private defaultDatabaseId: string;

  constructor(pool: Pool, databaseId: string = DEFAULT_DATABASE_ID, ttlMs: number = DEFAULT_TTL_MS) {
    this.pool = pool;
    this.defaultDatabaseId = databaseId;
    this.loader = new ModuleConfigLoader<BillingModuleConfigScoped>(
      pool, 'billing', BILLING_MODULE_SQL, mapBillingRow, ttlMs
    );
  }

  /**
   * Load billing module config for a database.
   * Returns null if billing is not provisioned.
   * Uses unambiguous single-instance resolution (scope = null).
   */
  async load(databaseId?: string): Promise<BillingModuleConfig | null> {
    const dbId = databaseId ?? this.defaultDatabaseId;
    const config = await this.loader.load(dbId);
    if (!config || !config.recordUsageFunction) return null;
    return config;
  }

  /**
   * Check if the entity has quota for this meter.
   * Returns true if billing is not provisioned (graceful degradation).
   */
  async checkQuota(
    entityId: string,
    meterSlug: string,
    amount: number = 1,
    databaseId?: string
  ): Promise<boolean> {
    const config = await this.load(databaseId);
    if (!config) return true;

    try {
      const sql = `SELECT "${config.privateSchema}"."check_billing_quota"($1, $2::uuid, $3) AS allowed`;
      const { rows } = await this.pool.query(sql, [meterSlug, entityId, amount]);
      return rows[0]?.allowed !== false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`check_billing_quota failed (allowing): ${msg}`);
      return true;
    }
  }

  /**
   * Record usage after a function completes.
   * No-ops if billing is not provisioned.
   */
  async recordUsage(
    entityId: string,
    meterSlug: string,
    amount: number,
    metadata: Record<string, unknown>,
    databaseId?: string
  ): Promise<void> {
    const config = await this.load(databaseId);
    if (!config) return;

    try {
      const sql = `SELECT "${config.privateSchema}"."${config.recordUsageFunction}"($1, $2::uuid, $3, $4::jsonb)`;
      await this.pool.query(sql, [meterSlug, entityId, amount, JSON.stringify(metadata)]);
      log.debug(`recorded usage: ${meterSlug} entity=${entityId} amount=${amount}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(`record_usage failed (non-fatal): ${msg}`);
    }
  }

  invalidate(databaseId?: string): void {
    this.loader.invalidate(databaseId);
  }
}
