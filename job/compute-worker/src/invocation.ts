/**
 * InvocationTracker — records function invocations in
 * constructive_infra_public.platform_function_invocations.
 *
 * Lifecycle:
 *   1. `create()` — inserts a row with status='running' before dispatch
 *   2. `complete()` — updates to status='completed' with result + duration
 *   3. `fail()` — updates to status='failed' with error + duration
 */

import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import type { CreateInvocationInput } from './types';

const log = new Logger('compute:invocation');

const CREATE_SQL = `
  INSERT INTO constructive_infra_public.platform_function_invocations
    (id, function_id, task_identifier, payload, job_id, database_id, actor_id, status, started_at)
  VALUES
    (gen_random_uuid(), $1, $2, $3::jsonb, $4, $5, $6, 'running', now())
  RETURNING id, started_at
`;

const COMPLETE_SQL = `
  UPDATE constructive_infra_public.platform_function_invocations
  SET
    status = 'completed',
    completed_at = now(),
    duration_ms = $2,
    result = $3::jsonb
  WHERE id = $1
`;

const FAIL_SQL = `
  UPDATE constructive_infra_public.platform_function_invocations
  SET
    status = 'failed',
    completed_at = now(),
    duration_ms = $2,
    error = $3
  WHERE id = $1
`;

export class InvocationTracker {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create an invocation record before dispatching the function.
   * Returns the invocation ID and start timestamp.
   */
  async create(input: CreateInvocationInput): Promise<{ id: string; started_at: Date }> {
    const payload_json = input.payload != null ? JSON.stringify(input.payload) : null;
    try {
      const { rows } = await this.pool.query(CREATE_SQL, [
        input.function_id,
        input.task_identifier,
        payload_json,
        String(input.job_id),
        input.database_id ?? null,
        input.actor_id ?? null,
      ]);
      const row = rows[0];
      log.debug(`created invocation ${row.id} for ${input.task_identifier}`);
      return { id: row.id, started_at: row.started_at };
    } catch (err: any) {
      log.error(`failed to create invocation for ${input.task_identifier}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Mark an invocation as completed with result and duration.
   */
  async complete(invocation_id: string, duration_ms: number, result?: unknown): Promise<void> {
    const result_json = result != null ? JSON.stringify(result) : null;
    try {
      await this.pool.query(COMPLETE_SQL, [invocation_id, duration_ms, result_json]);
      log.debug(`completed invocation ${invocation_id} (${duration_ms}ms)`);
    } catch (err: any) {
      log.error(`failed to complete invocation ${invocation_id}: ${err.message}`);
    }
  }

  /**
   * Mark an invocation as failed with error and duration.
   */
  async fail(invocation_id: string, duration_ms: number, error: string): Promise<void> {
    try {
      await this.pool.query(FAIL_SQL, [invocation_id, duration_ms, error]);
      log.debug(`failed invocation ${invocation_id}: ${error}`);
    } catch (err: any) {
      log.error(`failed to record failure for invocation ${invocation_id}: ${err.message}`);
    }
  }
}
