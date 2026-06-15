/**
 * BillingTracker — re-exports BillingLoader from @constructive-io/module-loader
 * under the legacy name `BillingTracker`.
 */

import { BillingLoader } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

export class BillingTracker extends BillingLoader {
  constructor(pool: Pool, databaseId: string, cacheTtlMs?: number) {
    super(pool, databaseId, cacheTtlMs);
  }
}
