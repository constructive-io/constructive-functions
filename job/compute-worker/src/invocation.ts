/**
 * InvocationTracker — records function invocations in the
 * dynamically-resolved invocations table.
 *
 * Schema and table names are resolved via ModuleLoader.
 *
 * Lifecycle:
 *   1. `create()` — inserts a row with status='running' before dispatch
 *   2. `complete()` — updates to status='completed' with result + duration
 *   3. `fail()` — updates to status='failed' with error + duration
 */

import type { InvocationModuleConfig } from '@constructive-io/module-loader';
import { ModuleLoader, ModuleNotProvisionedError, AmbiguousScopeError } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import type { CreateInvocationInput } from './types';

const log = new Logger('compute:invocation');

export class InvocationTracker {
  private pool: Pool;
  private loader: ModuleLoader;
  private databaseId: string;

  constructor(pool: Pool, loader: ModuleLoader, databaseId: string) {
    this.pool = pool;
    this.loader = loader;
    this.databaseId = databaseId;
  }

  private async resolveInvocationModule(
    scope?: string | null,
    targetDatabaseId?: string
  ): Promise<InvocationModuleConfig | null> {
    const dbId = targetDatabaseId ?? this.databaseId;
    try {
      return await this.loader.invocation.load(dbId, scope ?? null);
    } catch (err) {
      if (err instanceof ModuleNotProvisionedError) return null;
      if (err instanceof AmbiguousScopeError) {
        return await this.loader.invocation.load(dbId, 'app');
      }
      throw err;
    }
  }

  async create(input: CreateInvocationInput): Promise<{ id: string; started_at: Date }> {
    const scope = input.scope ?? null;
    const mod = await this.resolveInvocationModule(scope, input.database_id);
    if (!mod) {
      throw new Error(`no invocation module found for scope="${scope}"`);
    }

    const { publicSchema, invocationsTable } = mod;
    const payload_json = input.payload != null ? JSON.stringify(input.payload) : null;

    const sql = `
      INSERT INTO "${publicSchema}"."${invocationsTable}"
        (id, task_identifier, payload, job_id, database_id, actor_id, graph_execution_id, status, started_at)
      VALUES
        (gen_random_uuid(), $1, $2::jsonb, $3, $4, $5, $6, 'running', now())
      RETURNING id, started_at
    `;
    try {
      const { rows } = await this.pool.query(sql, [
        input.task_identifier,
        payload_json,
        String(input.job_id),
        input.database_id ?? this.databaseId,
        input.actor_id ?? null,
        input.graph_execution_id ?? null,
      ]);
      const row = rows[0];
      log.debug(`created invocation ${row.id} for ${input.task_identifier}`);
      return { id: row.id, started_at: row.started_at };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`failed to create invocation for ${input.task_identifier}: ${msg}`);
      throw err;
    }
  }

  async complete(
    invocation_id: string,
    duration_ms: number,
    result?: unknown,
    scope?: string | null,
    targetDatabaseId?: string
  ): Promise<void> {
    const mod = await this.resolveInvocationModule(scope, targetDatabaseId);
    if (!mod) {
      log.error(`no invocation module found for complete (scope=${scope})`);
      return;
    }

    const { publicSchema, invocationsTable } = mod;
    const result_json = result != null ? JSON.stringify(result) : null;
    const sql = `
      UPDATE "${publicSchema}"."${invocationsTable}"
      SET status = 'completed', completed_at = now(), duration_ms = $2, result = $3::jsonb
      WHERE id = $1
    `;
    try {
      await this.pool.query(sql, [invocation_id, duration_ms, result_json]);
      log.debug(`completed invocation ${invocation_id} (${duration_ms}ms)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`failed to complete invocation ${invocation_id}: ${msg}`);
    }
  }

  async fail(
    invocation_id: string,
    duration_ms: number,
    error: string,
    scope?: string | null,
    targetDatabaseId?: string
  ): Promise<void> {
    const mod = await this.resolveInvocationModule(scope, targetDatabaseId);
    if (!mod) {
      log.error(`no invocation module found for fail (scope=${scope})`);
      return;
    }

    const { publicSchema, invocationsTable } = mod;
    const sql = `
      UPDATE "${publicSchema}"."${invocationsTable}"
      SET status = 'failed', completed_at = now(), duration_ms = $2, error = $3
      WHERE id = $1
    `;
    try {
      await this.pool.query(sql, [invocation_id, duration_ms, error]);
      log.debug(`failed invocation ${invocation_id}: ${error}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`failed to record failure for invocation ${invocation_id}: ${msg}`);
    }
  }
}
