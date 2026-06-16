/**
 * FunctionDiscovery — lazy, cached lookups against the
 * platform function definitions table.
 *
 * Schema and table names are resolved dynamically via ModuleLoader.
 */

import { AmbiguousScopeError, ModuleLoader } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { TtlCache } from './cache';
import type { PlatformFunctionDefinition } from './types';

const log = new Logger('compute:discovery');

const COLUMNS = `
    id, name, task_identifier, service_url,
    is_invocable, is_built_in, max_attempts,
    priority, queue_name, scope, namespace_id,
    required_configs, required_secrets, description,
    runtime, inputs, outputs`;

export class FunctionDiscovery {
  private cache: TtlCache<PlatformFunctionDefinition | null>;
  private pool: Pool;
  private loader: ModuleLoader;
  private databaseId: string;

  constructor(pool: Pool, loader: ModuleLoader, databaseId: string, ttlMs = 60_000) {
    this.pool = pool;
    this.loader = loader;
    this.databaseId = databaseId;
    this.cache = new TtlCache<PlatformFunctionDefinition | null>(ttlMs);
  }

  private async resolveFunctionModule() {
    try {
      return await this.loader.function.load(this.databaseId, null);
    } catch (err) {
      if (err instanceof AmbiguousScopeError) {
        return await this.loader.function.load(this.databaseId, 'app');
      }
      throw err;
    }
  }

  async resolve(taskIdentifier: string): Promise<PlatformFunctionDefinition | null> {
    const cached = this.cache.get(taskIdentifier);
    if (cached !== undefined) return cached;

    try {
      const cfg = await this.resolveFunctionModule();
      const sql = `SELECT ${COLUMNS} FROM "${cfg.publicSchema}"."${cfg.definitionsTable}" WHERE task_identifier = $1 LIMIT 1`;
      const { rows } = await this.pool.query(sql, [taskIdentifier]);
      const def = (rows[0] as PlatformFunctionDefinition) ?? null;
      this.cache.set(taskIdentifier, def);
      return def;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`failed to resolve "${taskIdentifier}": ${msg}`);
      return null;
    }
  }

  async listInvocable(): Promise<PlatformFunctionDefinition[]> {
    try {
      const cfg = await this.resolveFunctionModule();
      const sql = `SELECT ${COLUMNS} FROM "${cfg.publicSchema}"."${cfg.definitionsTable}" WHERE is_invocable = true ORDER BY name`;
      const { rows } = await this.pool.query(sql);
      return rows as PlatformFunctionDefinition[];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`failed to list invocable functions: ${msg}`);
      return [];
    }
  }

  invalidate(taskIdentifier: string): void { this.cache.delete(taskIdentifier); }
  invalidateAll(): void { this.cache.clear(); }
}
