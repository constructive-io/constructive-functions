/**
 * ComputeLogTracker — writes to the compute_log table
 * after every job dispatch (success or failure) and triggers
 * the usage_daily rollup.
 *
 * Gracefully no-ops if compute_log_module is not provisioned.
 */

import { ModuleLoader, ModuleNotProvisionedError } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

const log = new Logger('compute:log-tracker');

export interface ComputeLogEntry {
  task_identifier: string;
  job_id: string | number;
  invocation_id?: string;
  database_id: string;
  entity_id?: string;
  organization_id?: string;
  entity_type?: string;
  actor_id?: string;
  status: 'completed' | 'failed';
  duration_ms: number;
  error?: string;
}

export class ComputeLogTracker {
  private pool: Pool;
  private loader: ModuleLoader;
  private databaseId: string;

  constructor(pool: Pool, loader: ModuleLoader, databaseId: string) {
    this.pool = pool;
    this.loader = loader;
    this.databaseId = databaseId;
  }

  async log(entry: ComputeLogEntry): Promise<void> {
    let cfg;
    try {
      cfg = await this.loader.computeLog.load(this.databaseId, null);
    } catch (err) {
      if (err instanceof ModuleNotProvisionedError) {
        log.debug('compute_log_module not provisioned — skipping log');
        return;
      }
      throw err;
    }

    const qualifiedTable = `"${cfg.publicSchema}"."${cfg.computeLogTable}"`;
    try {
      await this.pool.query(
        `INSERT INTO ${qualifiedTable}
          (completed_at, database_id, entity_id, organization_id, entity_type,
           actor_id, task_identifier, job_id, invocation_id, status, duration_ms, error)
        VALUES (now(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          entry.database_id,
          entry.entity_id || null,
          entry.organization_id || null,
          entry.entity_type || null,
          entry.actor_id || null,
          entry.task_identifier,
          entry.job_id,
          entry.invocation_id || null,
          entry.status,
          entry.duration_ms,
          entry.error || null,
        ]
      );
      log.debug(`logged ${entry.status} for ${entry.task_identifier} (${entry.duration_ms}ms)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`failed to write compute log: ${msg}`);
    }
  }

  async rollup(since?: Date): Promise<number> {
    let cfg;
    try {
      cfg = await this.loader.computeLog.load(this.databaseId, null);
    } catch (err) {
      if (err instanceof ModuleNotProvisionedError) {
        log.debug('compute_log_module not provisioned — skipping rollup');
        return 0;
      }
      throw err;
    }

    try {
      const result = await this.pool.query(
        `SELECT count(*) AS n FROM "${cfg.privateSchema}".rollup_compute_daily($1)`,
        [since || new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)]
      );
      const n = parseInt(result.rows[0]?.n ?? '0', 10);
      log.debug(`rollup upserted ${n} usage_daily row(s)`);
      return n;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`rollup failed: ${msg}`);
      return 0;
    }
  }
}
