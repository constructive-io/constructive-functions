import type { Pool } from 'pg';

import type { ModuleConfigLoader } from './generic-loader';
import type {
  FunctionModuleConfig,
  InvocationModuleConfig,
  NamespaceModuleConfig,
  SecretsModuleConfig,
  StorageModuleConfig,
} from './loaders';
import {
  createFunctionLoader,
  createInvocationLoader,
  createNamespaceLoader,
  createSecretsLoader,
  createStorageLoader,
} from './loaders';

export interface ModuleLoaderOptions {
  pool: Pool;
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

  constructor(opts: ModuleLoaderOptions) {
    const { pool, ttlMs } = opts;
    this.function = createFunctionLoader(pool, ttlMs);
    this.invocation = createInvocationLoader(pool, ttlMs);
    this.namespace = createNamespaceLoader(pool, ttlMs);
    this.secrets = createSecretsLoader(pool, ttlMs);
    this.storage = createStorageLoader(pool, ttlMs);
  }

  invalidate(databaseId?: string): void {
    this.function.invalidate(databaseId);
    this.invocation.invalidate(databaseId);
    this.namespace.invalidate(databaseId);
    this.secrets.invalidate(databaseId);
    this.storage.invalidate(databaseId);
  }
}
