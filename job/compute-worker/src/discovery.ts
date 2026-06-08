/**
 * FunctionDiscovery — lazy, cached lookups against
 * constructive_infra_public.platform_function_definitions.
 *
 * When a job arrives the worker calls `resolve(taskIdentifier)`.
 * On cache miss, a single SQL query fetches the function definition
 * and caches it for `ttlMs` (default 60 s). Subsequent calls for the
 * same task_identifier are served from memory.
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { PlatformFunctionDefinition } from './types';

const log = new Logger('compute:discovery');

const RESOLVE_SQL = `
  SELECT
    id, name, task_identifier, service_url,
    is_invocable, is_built_in, max_attempts,
    priority, queue_name, scope, namespace_id,
    required_configs, required_secrets, description
  FROM constructive_infra_public.platform_function_definitions
  WHERE task_identifier = $1
  LIMIT 1
`;

const LIST_INVOCABLE_SQL = `
  SELECT
    id, name, task_identifier, service_url,
    is_invocable, is_built_in, max_attempts,
    priority, queue_name, scope, namespace_id,
    required_configs, required_secrets, description
  FROM constructive_infra_public.platform_function_definitions
  WHERE is_invocable = true
  ORDER BY name
`;

export class FunctionDiscovery {
  private cache: TtlCache<PlatformFunctionDefinition | null>;
  private pool: Pool;

  constructor(pool: Pool, ttlMs = 60_000) {
    this.pool = pool;
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
      const { rows } = await this.pool.query(RESOLVE_SQL, [taskIdentifier]);
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
      const { rows } = await this.pool.query(LIST_INVOCABLE_SQL);
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
