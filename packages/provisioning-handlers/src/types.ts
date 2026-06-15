import type { Pool } from 'pg';

export interface ProvisioningContext {
  pool: Pool;
  databaseId: string;
}

export type ProvisioningHandler = (
  payload: Record<string, unknown>,
  context: ProvisioningContext
) => Promise<Record<string, unknown>>;
