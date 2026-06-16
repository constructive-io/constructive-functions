/** Minimal query interface compatible with both pg.Pool and pg.Client. */
export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

export interface ScopedModuleConfig {
  scope: string;
}

export class ModuleNotProvisionedError extends Error {
  constructor(module: string, databaseId: string, scope?: string | null) {
    const scopeMsg = scope ? ` at scope '${scope}'` : '';
    super(`Module '${module}' not provisioned for database '${databaseId}'${scopeMsg}`);
    this.name = 'ModuleNotProvisionedError';
  }
}

export class AmbiguousScopeError extends Error {
  constructor(module: string, databaseId: string, count: number) {
    super(
      `Ambiguous: ${count} '${module}' instances for database '${databaseId}'. ` +
      `Provide entity_type to disambiguate.`
    );
    this.name = 'AmbiguousScopeError';
  }
}

interface CacheEntry<T> {
  data: T[];
  expiresAt: number;
}

/**
 * Generic MetaSchema module config loader.
 *
 * Queries a `metaschema_modules_public.*_module` table by database_id,
 * caches the result, and provides scope-aware resolution.
 *
 * No fallback defaults — throws if the module is not provisioned.
 */
export class ModuleConfigLoader<T extends ScopedModuleConfig> {
  private cache = new Map<string, CacheEntry<T>>();
  private queryable: Queryable;
  private sql: string;
  private moduleName: string;
  private mapper: (row: Record<string, unknown>) => T;
  private ttlMs: number;

  constructor(opts: {
    pool: Queryable;
    sql: string;
    moduleName: string;
    mapper: (row: Record<string, unknown>) => T;
    ttlMs?: number;
  }) {
    this.queryable = opts.pool;
    this.sql = opts.sql;
    this.moduleName = opts.moduleName;
    this.mapper = opts.mapper;
    this.ttlMs = opts.ttlMs ?? 60_000;
  }

  /**
   * Load all module instances for a database (cached).
   */
  async loadAll(databaseId: string): Promise<T[]> {
    const cached = this.cache.get(databaseId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    const { rows } = await this.queryable.query(this.sql, [databaseId]);
    const configs = rows.map(this.mapper);
    this.cache.set(databaseId, { data: configs, expiresAt: Date.now() + this.ttlMs });
    return configs;
  }

  /**
   * Load a single module instance.
   *
   * - scope provided → filter by it
   * - scope null + 1 result → return it (unambiguous)
   * - scope null + 0 results → throw ModuleNotProvisionedError
   * - scope null + 2+ results → throw AmbiguousScopeError
   */
  async load(databaseId: string, scope?: string | null): Promise<T> {
    const all = await this.loadAll(databaseId);

    if (scope) {
      const match = all.find((c) => c.scope === scope);
      if (!match) {
        throw new ModuleNotProvisionedError(this.moduleName, databaseId, scope);
      }
      return match;
    }

    if (all.length === 0) {
      throw new ModuleNotProvisionedError(this.moduleName, databaseId);
    }
    if (all.length > 1) {
      throw new AmbiguousScopeError(this.moduleName, databaseId, all.length);
    }
    return all[0];
  }

  /**
   * Invalidate cache for a specific database or all databases.
   */
  invalidate(databaseId?: string): void {
    if (databaseId) {
      this.cache.delete(databaseId);
    } else {
      this.cache.clear();
    }
  }
}
