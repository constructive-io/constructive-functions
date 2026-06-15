/**
 * @constructive-io/module-loader
 *
 * Unified MetaSchema module loader for the Constructive platform.
 * Resolves compute, usage, and billing table/schema names dynamically
 * with TTL caching. Multi-database (platform + tenant) aware.
 *
 * Usage:
 *   import { ModuleLoader, getModuleLoader } from '@constructive-io/module-loader';
 *
 *   const loader = getModuleLoader(pool);
 *   const cfg = await loader.compute();           // platform scope
 *   const cfg = await loader.compute(tenantId);   // tenant scope
 *   loader.logCompute(entry);                     // fire-and-forget
 */

// Core
export { TtlCache } from './cache';
export { ModuleLoader, getModuleLoader, _resetModuleLoaderCache } from './module-loader';

// Domain loaders
export { ComputeModuleLoader } from './compute-loader';
export type { ComputeModuleConfigExtended } from './compute-loader';
export { UsageLoader, USAGE_DEFAULTS } from './usage-loader';
export { BillingLoader } from './billing-loader';

// Types
export type {
  BillingModuleConfig,
  ComputeLogModuleConfig,
  ComputeModuleConfig,
  FunctionModuleConfig,
  GraphExecutionModuleConfig,
  InferenceEntry,
  InvocationModuleConfig,
  MeterEntry,
  ModuleLoaderOptions,
  StorageEntry,
  UsageTableConfig,
} from './types';
export { DEFAULT_DATABASE_ID, DEFAULT_TTL_MS } from './types';
