/**
 * ModuleLoader — unified entry point for all MetaSchema module resolution.
 *
 * Provides a single instance per pool that lazily resolves:
 * - Compute modules (function definitions, invocations, compute logs, graph execution)
 * - Usage modules (metering table names)
 * - Billing modules (quota + usage recording)
 *
 * Multi-database (platform + tenant):
 *   const loader = new ModuleLoader({ pool });
 *   loader.compute();             // platform scope (default)
 *   loader.compute(tenantDbId);   // tenant scope
 *   loader.usage(tenantDbId);     // tenant usage tables
 *
 * Scope-aware metering:
 *   loader.logCompute(entry);           // resolves scope from entry.databaseId
 *   loader.logInference(entry);
 *   loader.logStorage(entry);
 */

import type { Pool } from 'pg';

import { BillingLoader } from './billing-loader';
import { ComputeModuleLoader } from './compute-loader';
import type { ComputeModuleConfigExtended } from './compute-loader';
import type {
  BillingModuleConfig,
  InferenceEntry,
  MeterEntry,
  ModuleLoaderOptions,
  StorageEntry,
  UsageTableConfig,
} from './types';
import { DEFAULT_DATABASE_ID, DEFAULT_TTL_MS } from './types';
import { UsageLoader } from './usage-loader';

export class ModuleLoader {
  readonly computeLoader: ComputeModuleLoader;
  readonly usageLoader: UsageLoader;
  readonly billingLoader: BillingLoader;

  private pool: Pool;
  private defaultDatabaseId: string;

  constructor(opts: ModuleLoaderOptions) {
    this.pool = opts.pool;
    this.defaultDatabaseId = opts.databaseId ?? DEFAULT_DATABASE_ID;
    const ttl = opts.cacheTtlMs ?? DEFAULT_TTL_MS;

    this.computeLoader = new ComputeModuleLoader(this.pool, ttl);
    this.usageLoader = new UsageLoader(this.pool, this.defaultDatabaseId, ttl);
    this.billingLoader = new BillingLoader(this.pool, this.defaultDatabaseId, ttl);
  }

  // ─── Compute Resolution ─────────────────────────────────────────────────

  compute(databaseId?: string): Promise<ComputeModuleConfigExtended> {
    return this.computeLoader.load(databaseId ?? this.defaultDatabaseId);
  }

  // ─── Usage Resolution ───────────────────────────────────────────────────

  usage(databaseId?: string): Promise<UsageTableConfig> {
    return this.usageLoader.resolve(databaseId);
  }

  // ─── Billing Resolution ─────────────────────────────────────────────────

  billing(databaseId?: string): Promise<BillingModuleConfig | null> {
    return this.billingLoader.load(databaseId);
  }

  // ─── Fire-and-forget Metering ───────────────────────────────────────────

  logCompute(entry: MeterEntry): string {
    return this.usageLoader.logComputeUsage(entry);
  }

  logInference(entry: InferenceEntry): void {
    this.usageLoader.logInferenceUsage(entry);
  }

  logStorage(entry: StorageEntry): void {
    this.usageLoader.logStorageUsage(entry);
  }

  // ─── Billing Convenience ────────────────────────────────────────────────

  checkQuota(entityId: string, meterSlug: string, amount?: number, databaseId?: string): Promise<boolean> {
    return this.billingLoader.checkQuota(entityId, meterSlug, amount, databaseId);
  }

  recordUsage(entityId: string, meterSlug: string, amount: number, metadata: Record<string, unknown>, databaseId?: string): Promise<void> {
    return this.billingLoader.recordUsage(entityId, meterSlug, amount, metadata, databaseId);
  }

  // ─── Cache Control ──────────────────────────────────────────────────────

  invalidate(databaseId?: string): void {
    if (databaseId) {
      this.computeLoader.invalidate(databaseId);
      this.usageLoader.invalidate(databaseId);
      this.billingLoader.invalidate(databaseId);
    } else {
      this.computeLoader.invalidateAll();
      this.usageLoader.invalidate();
      this.billingLoader.invalidate();
    }
  }
}

// ─── Convenience Factory ──────────────────────────────────────────────────────

let _instance: ModuleLoader | null = null;
let _pool: Pool | null = null;

/**
 * Get or create a ModuleLoader for the given pool.
 * Reuses the same instance as long as the pool reference matches.
 */
export function getModuleLoader(pool: Pool, databaseId?: string): ModuleLoader {
  if (_instance && _pool === pool) return _instance;
  _instance = new ModuleLoader({ pool, databaseId });
  _pool = pool;
  return _instance;
}

/** Reset the module-level cache (for testing). */
export function _resetModuleLoaderCache(): void {
  _instance = null;
  _pool = null;
}
