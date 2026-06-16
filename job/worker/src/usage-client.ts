/**
 * Usage client for the job/worker — wraps compute-meter.ts.
 */

import type { Pool } from 'pg';

import type { MeterEntry } from './compute-meter';
import { logComputeUsage } from './compute-meter';

export type { MeterEntry };

export class UsageClient {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  logComputeUsage(entry: MeterEntry): string {
    return logComputeUsage(this.pool, entry);
  }
}
