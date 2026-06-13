/**
 * FunctionDiscovery — lazy, cached lookups against the
 * platform function definitions table.
 *
 * Schema and table names are resolved dynamically via ComputeModuleLoader
 * instead of hardcoding a specific schema. When a job arrives the worker
 * calls `resolve(taskIdentifier)`. On cache miss, a single SQL query
 * fetches the function definition and caches it for `ttlMs` (default 60 s).
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { ComputeModuleLoader } from './module-loader';
import type { PlatformFunctionDefinition } from './types';

const log = new Logger('compute:discovery');

const COLUMNS = `
    id, name, task_identifier, service_url,
    is_invocable, is_built_in, max_attempts,
    priority, queue_name, scope, namespace_id,
    required_configs, required_secrets, description,
    runtime`;

export class FunctionDiscovery {
  private cache: TtlCache<PlatformFunctionDefinition | null>;
  private pool: Pool;
  private loader: ComputeModuleLoader;
  private databaseId: string;

  constructor(pool: Pool, loader: ComputeModuleLoader, databaseId: string, ttlMs = 60_000) {
    this.pool = pool;
    this.loader = loader;
    this.databaseId = databaseId;
    this.cache = new TtlCache<PlatformFunctionDefinition | null>(ttlMs);
  }

  /**
   * Lazily resolve a function definition by task_identifier.
   * Returns null if not registered. Results are TTL-cached.
   */
  async resolve(taskIdentifier: string): Promise<PlatformFunctionDefinition | null> {
    const cached = this.cache.get(taskIdentifier);
    if (cached !== undefined) {
      log.debug(`cache hit: ${taskIdentifier}`);
      return cached;
    }

    log.debug(`cache miss: ${taskIdentifier}, querying DB`);
    try {
      const config = await this.loader.load(this.databaseId);
      const publicSchema = config.functionModule?.publicSchema ?? 'constructive_compute_public';
      const definitionsTable = config.functionModule?.definitionsTable ?? 'platform_function_definitions';
      const sql = `SELECT ${COLUMNS} FROM "${publicSchema}"."${definitionsTable}" WHERE task_identifier = $1 LIMIT 1`;

      const { rows } = await this.pool.query(sql, [taskIdentifier]);
      const def = (rows[0] as PlatformFunctionDefinition) ?? null;
      this.cache.set(taskIdentifier, def);
      if (def) {
        log.info(`resolved function: ${def.name} (${taskIdentifier}) → ${def.service_url ?? 'no url'}`);
      } else {
        log.warn(`no function registered for task_identifier="${taskIdentifier}"`);
      }
      return def;
    } catch (err: any) {
      log.error(`failed to resolve "${taskIdentifier}": ${err.message}`);
      return null;
    }
  }

  /**
   * List all invocable function definitions.
   * Not cached — intended for startup diagnostics / admin endpoints.
   */
  async listInvocable(): Promise<PlatformFunctionDefinition[]> {
    try {
      const config = await this.loader.load(this.databaseId);
      const publicSchema = config.functionModule?.publicSchema ?? 'constructive_compute_public';
      const definitionsTable = config.functionModule?.definitionsTable ?? 'platform_function_definitions';
      const sql = `SELECT ${COLUMNS} FROM "${publicSchema}"."${definitionsTable}" WHERE is_invocable = true ORDER BY name`;

      const { rows } = await this.pool.query(sql);
      return rows as PlatformFunctionDefinition[];
    } catch (err: any) {
      log.error(`failed to list invocable functions: ${err.message}`);
      return [];
    }
  }

  /** Invalidate cached entry for a specific task. */
  invalidate(taskIdentifier: string): void {
    this.cache.delete(taskIdentifier);
  }

  /** Clear the entire cache. */
  invalidateAll(): void {
    this.cache.clear();
  }
}
