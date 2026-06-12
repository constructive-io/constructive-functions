/**
 * BillingTracker — quota checks and usage recording via the billing_module.
 *
 * Discovers billing configuration from metaschema_modules_public.billing_module.
 * Gracefully no-ops when billing is not provisioned (standalone dev mode).
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { BillingModuleConfig } from './types';

const log = new Logger('compute:billing');

const BILLING_MODULE_SQL = `
  SELECT
    s.schema_name  AS public_schema,
    ps.schema_name AS private_schema,
    bm.record_usage_function
  FROM metaschema_modules_public.billing_module bm
  JOIN metaschema_public.schema s  ON bm.schema_id = s.id
  JOIN metaschema_public.schema ps ON bm.private_schema_id = ps.id
  WHERE bm.database_id = $1
  LIMIT 1
`;

export class BillingTracker {
  private pool: Pool;
  private cache: TtlCache<BillingModuleConfig | null>;
  private databaseId: string;

  constructor(pool: Pool, databaseId: string, cacheTtlMs?: number) {
    this.pool = pool;
    this.databaseId = databaseId;
    this.cache = new TtlCache<BillingModuleConfig | null>(cacheTtlMs ?? 60_000);
  }

  async load(databaseId?: string): Promise<BillingModuleConfig | null> {
    const dbId = databaseId ?? this.databaseId;
    const cached = this.cache.get(dbId);
    if (cached !== undefined) return cached;

    try {
      const { rows } = await this.pool.query(BILLING_MODULE_SQL, [dbId]);
      if (!rows.length || !rows[0].record_usage_function) {
        this.cache.set(dbId, null);
        return null;
      }
      const config: BillingModuleConfig = {
        publicSchema: rows[0].public_schema,
        privateSchema: rows[0].private_schema,
        recordUsageFunction: rows[0].record_usage_function,
      };
      log.debug(`loaded billing module: ${config.privateSchema}.${config.recordUsageFunction}`);
      this.cache.set(dbId, config);
      return config;
    } catch {
      this.cache.set(dbId, null);
      return null;
    }
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
    } catch (err: any) {
      log.warn(`check_billing_quota failed (allowing): ${err.message}`);
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
    } catch (err: any) {
      log.warn(`record_usage failed (non-fatal): ${err.message}`);
    }
  }
}
