import type { ModuleConfigLoader, Queryable } from './generic-loader';
import type {
  BillingModuleConfig,
  ComputeLogModuleConfig,
  FunctionModuleConfig,
  GraphModuleConfig,
  InvocationModuleConfig,
  NamespaceModuleConfig,
  SecretsModuleConfig,
  StorageModuleConfig,
} from './loaders';
import {
  createBillingLoader,
  createComputeLogLoader,
  createFunctionLoader,
  createGraphLoader,
  createInvocationLoader,
  createNamespaceLoader,
  createSecretsLoader,
  createStorageLoader,
} from './loaders';

export interface ModuleLoaderOptions {
  pool: Queryable;
  ttlMs?: number;
}

/**
 * Unified entry point for all MetaSchema module resolution.
 *
 * Each sub-loader queries a single module table and caches results per database_id.
 * No fallback defaults — throws if a module is not provisioned.
 */
export class ModuleLoader {
  readonly function: ModuleConfigLoader<FunctionModuleConfig>;
  readonly invocation: ModuleConfigLoader<InvocationModuleConfig>;
  readonly namespace: ModuleConfigLoader<NamespaceModuleConfig>;
  readonly secrets: ModuleConfigLoader<SecretsModuleConfig>;
  readonly storage: ModuleConfigLoader<StorageModuleConfig>;
  readonly computeLog: ModuleConfigLoader<ComputeLogModuleConfig>;
  readonly graph: ModuleConfigLoader<GraphModuleConfig>;
  readonly billing: ModuleConfigLoader<BillingModuleConfig>;

  constructor(opts: ModuleLoaderOptions) {
    const { pool, ttlMs } = opts;
    this.function = createFunctionLoader(pool, ttlMs);
    this.invocation = createInvocationLoader(pool, ttlMs);
    this.namespace = createNamespaceLoader(pool, ttlMs);
    this.secrets = createSecretsLoader(pool, ttlMs);
    this.storage = createStorageLoader(pool, ttlMs);
    this.computeLog = createComputeLogLoader(pool, ttlMs);
    this.graph = createGraphLoader(pool, ttlMs);
    this.billing = createBillingLoader(pool, ttlMs);
  }

  invalidate(databaseId?: string): void {
    this.function.invalidate(databaseId);
    this.invocation.invalidate(databaseId);
    this.namespace.invalidate(databaseId);
    this.secrets.invalidate(databaseId);
    this.storage.invalidate(databaseId);
    this.computeLog.invalidate(databaseId);
    this.graph.invalidate(databaseId);
    this.billing.invalidate(databaseId);
  }
}
