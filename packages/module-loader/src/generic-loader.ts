/**
 * ModuleConfigLoader<T> — generic base for all MetaSchema module loaders.
 *
 * Each module table in metaschema_modules_public shares a common pattern:
 *   (database_id, scope, prefix) unique constraint.
 *
 * This base class provides:
 *   - TTL-cached queries by database_id (stores full array of configs)
 *   - Scope-aware resolution: loadAll(dbId) returns every instance,
 *     load(dbId, scope?) returns a single instance with ambiguity protection
 *   - Graceful fallback when the module table doesn't exist (dev mode)
 *
 * Scope contract:
 *   - scope provided → filter array by exact match
 *   - scope null + 1 result → return it (unambiguous)
 *   - scope null + 0 results → return null (not provisioned)
 *   - scope null + 2+ results → throw AmbiguousScopeError
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import { DEFAULT_TTL_MS } from './types';

// ─── Error Types ─────────────────────────────────────────────────────────────

export class AmbiguousScopeError extends Error {
  constructor(moduleName: string, databaseId: string, count: number) {
    super(
      `Ambiguous module resolution: ${moduleName} has ${count} instances ` +
        `for database ${databaseId}. Provide entity_type to disambiguate scope.`
    );
    this.name = 'AmbiguousScopeError';
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

/** Every module config must carry its scope. */
export interface ScopedModuleConfig {
  scope: string;
}

/** Row mapper: transforms a raw SQL row into a typed config. */
export type RowMapper<T> = (row: Record<string, string>) => T;

// ─── Generic Loader ──────────────────────────────────────────────────────────

export class ModuleConfigLoader<T extends ScopedModuleConfig> {
  private cache: TtlCache<T[]>;
  private pool: Pool;
  private sql: string;
  private mapper: RowMapper<T>;
  private moduleName: string;
  private log: Logger;

  constructor(
    pool: Pool,
    moduleName: string,
    sql: string,
    mapper: RowMapper<T>,
    ttlMs: number = DEFAULT_TTL_MS
  ) {
    this.pool = pool;
    this.moduleName = moduleName;
    this.sql = sql;
    this.mapper = mapper;
    this.cache = new TtlCache<T[]>(ttlMs);
    this.log = new Logger(`module-loader:${moduleName}`);
  }

  /**
   * Load ALL module instances for a database (cached as array).
   * Returns empty array if module table doesn't exist or has no rows.
   */
  async loadAll(databaseId: string): Promise<T[]> {
    const cached = this.cache.get(databaseId);
    if (cached !== undefined) {
      this.log.debug(`cache hit for database ${databaseId}`);
      return cached;
    }

    this.log.debug(`cache miss for database ${databaseId}, querying metaschema`);

    try {
      const { rows } = await this.pool.query(this.sql, [databaseId]);
      const configs = rows.map(this.mapper);
      this.cache.set(databaseId, configs);
      this.log.info(
        `loaded ${configs.length} ${this.moduleName} instance(s) for database ${databaseId}` +
          (configs.length > 0
            ? `: scopes=[${configs.map((c) => c.scope).join(', ')}]`
            : '')
      );
      return configs;
    } catch {
      this.log.debug(
        `${this.moduleName} table not available for database ${databaseId}`
      );
      this.cache.set(databaseId, []);
      return [];
    }
  }

  /**
   * Load a single module instance for a database + optional scope.
   *
   * - scope provided → exact match (first match wins)
   * - scope null + 1 instance → return it (unambiguous)
   * - scope null + 0 instances → return null
   * - scope null + 2+ instances → throw AmbiguousScopeError
   */
  async load(
    databaseId: string,
    scope?: string | null
  ): Promise<T | null> {
    const all = await this.loadAll(databaseId);

    if (all.length === 0) return null;

    if (scope != null) {
      return all.find((c) => c.scope === scope) ?? null;
    }

    // No scope provided — resolve unambiguously
    if (all.length === 1) return all[0];

    throw new AmbiguousScopeError(this.moduleName, databaseId, all.length);
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
