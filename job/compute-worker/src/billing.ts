/**
 * BillingTracker — quota checks and usage recording via billing_module.
 *
 * Resolves billing config dynamically via ModuleLoader. Gracefully no-ops
 * when billing is not provisioned (standalone dev mode).
 */

import type { BillingModuleConfig } from '@constructive-io/module-loader';
import { AmbiguousScopeError, ModuleLoader, ModuleNotProvisionedError } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

export class BillingTracker {
  private loader: ModuleLoader;
  private pool: Pool;
  private databaseId: string;

  constructor(pool: Pool, databaseId: string) {
    this.pool = pool;
    this.databaseId = databaseId;
    this.loader = new ModuleLoader({ pool });
  }

  async load(databaseId?: string): Promise<BillingModuleConfig | null> {
    try {
      return await this.loader.billing.load(databaseId ?? this.databaseId, null);
    } catch (err) {
      if (err instanceof ModuleNotProvisionedError) return null;
      if (err instanceof AmbiguousScopeError) {
        return await this.loader.billing.loadDefault(databaseId ?? this.databaseId);
      }
      return null;
    }
  }

  async checkQuota(entityId: string, meterSlug: string, amount = 1, databaseId?: string): Promise<boolean> {
    const config = await this.load(databaseId);
    if (!config) return true;
    try {
      const sql = `SELECT "${config.privateSchema}"."check_billing_quota"($1, $2::uuid, $3) AS allowed`;
      const { rows } = await this.pool.query(sql, [meterSlug, entityId, amount]);
      return rows[0]?.allowed !== false;
    } catch {
      return true;
    }
  }

  async recordUsage(entityId: string, meterSlug: string, amount: number, metadata: Record<string, unknown>, databaseId?: string): Promise<void> {
    const config = await this.load(databaseId);
    if (!config) return;
    try {
      const sql = `SELECT "${config.privateSchema}"."${config.recordUsageFunction}"($1, $2::uuid, $3, $4::jsonb)`;
      await this.pool.query(sql, [meterSlug, entityId, amount, JSON.stringify(metadata)]);
    } catch { /* non-fatal */ }
  }

  invalidate(databaseId?: string): void {
    this.loader.billing.invalidate(databaseId);
  }
}
