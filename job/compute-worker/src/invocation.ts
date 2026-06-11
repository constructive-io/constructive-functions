/**
 * InvocationTracker — records function invocations in the
 * dynamically-resolved invocations table.
 *
 * Supports both platform-scoped and org-scoped invocations:
 *   - Platform scope: no owner_id column
 *   - Org scope: includes owner_id (entity_id) pointing to the orgs table
 *
 * Schema and table names are resolved via ComputeModuleLoader.
 *
 * Lifecycle:
 *   1. `create()` — inserts a row with status='running' before dispatch
 *   2. `complete()` — updates to status='completed' with result + duration
 *   3. `fail()` — updates to status='failed' with error + duration
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import type { ComputeModuleLoader } from './module-loader';
import type { CreateInvocationInput, InvocationModuleConfig } from './types';

const log = new Logger('compute:invocation');

export class InvocationTracker {
  private pool: Pool;
  private loader: ComputeModuleLoader;
  private databaseId: string;

  constructor(pool: Pool, loader: ComputeModuleLoader, databaseId: string) {
    this.pool = pool;
    this.loader = loader;
    this.databaseId = databaseId;
  }

  /**
   * Resolve the invocation module matching the desired scope.
   * Falls back to the first available module if no scope match.
   */
  private async resolveInvocationModule(
    scope?: string,
    targetDatabaseId?: string
  ): Promise<InvocationModuleConfig | null> {
    const dbId = targetDatabaseId ?? this.databaseId;
    const config = await this.loader.load(dbId);
    if (!config.invocationModules.length) return null;

    if (scope) {
      const match = config.invocationModules.find((m) => m.scope === scope);
      if (match) return match;
    }

    return config.invocationModules[0];
  }

  /**
   * Create an invocation record before dispatching the function.
   * Returns the invocation ID and start timestamp.
   *
   * When entity_id is present, uses org-scoped invocation table and
   * sets owner_id. Otherwise uses platform-scoped table.
   */
  async create(input: CreateInvocationInput): Promise<{ id: string; started_at: Date }> {
    const scope = input.scope ?? (input.entity_id ? 'org' : 'platform');
    const targetDbId = scope === 'org' ? input.database_id : undefined;
    const mod = await this.resolveInvocationModule(scope, targetDbId);
    if (!mod) {
      throw new Error(`no invocation module found for scope="${scope}"`);
    }

    const { publicSchema, invocationsTable } = mod;
    const payload_json = input.payload != null ? JSON.stringify(input.payload) : null;

    if (input.entity_id) {
      const sql = `
        INSERT INTO "${publicSchema}"."${invocationsTable}"
          (id, function_id, task_identifier, payload, job_id, database_id, actor_id, owner_id, status, started_at)
        VALUES
          (gen_random_uuid(), $1, $2, $3::jsonb, $4, $5, $6, $7, 'running', now())
        RETURNING id, started_at
      `;
      try {
        const { rows } = await this.pool.query(sql, [
          input.function_id,
          input.task_identifier,
          payload_json,
          String(input.job_id),
          input.database_id ?? null,
          input.actor_id ?? null,
          input.entity_id,
        ]);
        const row = rows[0];
        log.debug(`created org-scoped invocation ${row.id} for ${input.task_identifier} (entity=${input.entity_id})`);
        return { id: row.id, started_at: row.started_at };
      } catch (err: any) {
        log.error(`failed to create org-scoped invocation for ${input.task_identifier}: ${err.message}`);
        throw err;
      }
    }

    const sql = `
      INSERT INTO "${publicSchema}"."${invocationsTable}"
        (id, function_id, task_identifier, payload, job_id, database_id, actor_id, status, started_at)
      VALUES
        (gen_random_uuid(), $1, $2, $3::jsonb, $4, $5, $6, 'running', now())
      RETURNING id, started_at
    `;
    try {
      const { rows } = await this.pool.query(sql, [
        input.function_id,
        input.task_identifier,
        payload_json,
        String(input.job_id),
        input.database_id ?? null,
        input.actor_id ?? null,
      ]);
      const row = rows[0];
      log.debug(`created platform-scoped invocation ${row.id} for ${input.task_identifier}`);
      return { id: row.id, started_at: row.started_at };
    } catch (err: any) {
      log.error(`failed to create invocation for ${input.task_identifier}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Mark an invocation as completed with result and duration.
   * Uses the same scope resolution as create to find the right table.
   */
  async complete(
    invocation_id: string,
    duration_ms: number,
    result?: unknown,
    scope?: string,
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
    } catch (err: any) {
      log.error(`failed to complete invocation ${invocation_id}: ${err.message}`);
    }
  }

  /**
   * Mark an invocation as failed with error and duration.
   */
  async fail(
    invocation_id: string,
    duration_ms: number,
    error: string,
    scope?: string,
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
    } catch (err: any) {
      log.error(`failed to record failure for invocation ${invocation_id}: ${err.message}`);
    }
  }
}
