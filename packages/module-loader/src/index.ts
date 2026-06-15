/**
 * @constructive-io/module-loader
 *
 * Unified MetaSchema module loader for the Constructive platform.
 * Resolves compute, namespace, secrets, storage, usage, and billing
 * table/schema names dynamically with TTL caching.
 *
 * Multi-database (platform + tenant) and scope-aware.
 *
 * Usage:
 *   import { ModuleLoader, getModuleLoader } from '@constructive-io/module-loader';
 *
 *   const loader = getModuleLoader(pool);
 *   const cfg = await loader.compute();                // composite config
 *   const ns = await loader.namespace.load(dbId);      // unambiguous single-instance
 *   const ns = await loader.namespace.load(dbId, 'org'); // explicit scope
 *   const all = await loader.namespace.loadAll(dbId);  // all scopes
 */

// Core
export { TtlCache } from './cache';
export { ModuleConfigLoader, AmbiguousScopeError } from './generic-loader';
export type { ScopedModuleConfig, RowMapper } from './generic-loader';
export { ModuleLoader, getModuleLoader, _resetModuleLoaderCache } from './module-loader';

// Domain loaders
export { ComputeModuleLoader, FunctionModuleLoader, InvocationModuleLoader, ComputeLogModuleLoader, GraphExecutionModuleLoader } from './compute-loader';
export type { ComputeModuleConfigExtended } from './compute-loader';
export { UsageLoader, USAGE_DEFAULTS } from './usage-loader';
export { BillingLoader } from './billing-loader';
export { NamespaceModuleLoader } from './namespace-loader';
export type { NamespaceModuleConfig } from './namespace-loader';
export { SecretsModuleLoader } from './secrets-loader';
export type { SecretsModuleConfig } from './secrets-loader';
export { StorageModuleLoader } from './storage-loader';
export type { StorageModuleConfig } from './storage-loader';

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
