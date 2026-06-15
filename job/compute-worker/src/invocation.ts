/**
 * InvocationTracker — records function invocations in the
 * dynamically-resolved invocations table.
 *
 * Uses the generic ModuleConfigLoader for scope-aware resolution:
 *   - scope provided → exact match against invocation module scope
 *   - scope null + 1 module → use it (unambiguous)
 *   - scope null + 2+ modules → throws AmbiguousScopeError
 *
 * Lifecycle:
 *   1. `create()` — inserts a row with status='running' before dispatch
 *   2. `complete()` — updates to status='completed' with result + duration
 *   3. `fail()` — updates to status='failed' with error + duration
 */

import type { ComputeModuleLoader, InvocationModuleConfig } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import type { CreateInvocationInput } from './types';

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
   * Uses the generic loader's scope resolution:
   *   - scope provided → exact match
   *   - scope null + 1 module → unambiguous
   *   - scope null + 0 modules → null
   */
  private async resolveInvocationModule(
    scope?: string | null,
    targetDatabaseId?: string
  ): Promise<InvocationModuleConfig | null> {
    const dbId = targetDatabaseId ?? this.databaseId;
    return this.loader.invocation.load(dbId, scope);
  }

  /**
   * Create an invocation record before dispatching the function.
   * Returns the invocation ID and start timestamp.
   */
  async create(input: CreateInvocationInput): Promise<{ id: string; started_at: Date }> {
    const scope = input.scope ?? null;
    const targetDbId = scope === 'org' ? input.database_id : undefined;
    const mod = await this.resolveInvocationModule(scope, targetDbId);
    if (!mod) {
      throw new Error(`no invocation module found for scope="${scope ?? 'null'}"`);
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
      log.debug(`created invocation ${row.id} for ${input.task_identifier} (scope=${scope ?? 'default'})`);
      return { id: row.id, started_at: row.started_at };
    } catch (err: any) {
      log.error(`failed to create invocation for ${input.task_identifier}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Mark an invocation as completed with result and duration.
   */
  async complete(
    invocation_id: string,
    duration_ms: number,
    result?: unknown,
    scope?: string | null,
    targetDatabaseId?: string
  ): Promise<void> {
    const mod = await this.resolveInvocationModule(scope, targetDatabaseId);
    if (!mod) {
      log.error(`no invocation module found for complete (scope=${scope ?? 'null'})`);
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
    scope?: string | null,
    targetDatabaseId?: string
  ): Promise<void> {
    const mod = await this.resolveInvocationModule(scope, targetDatabaseId);
    if (!mod) {
      log.error(`no invocation module found for fail (scope=${scope ?? 'null'})`);
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
