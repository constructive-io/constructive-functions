import type { Pool } from 'pg';

export interface ProvisioningContext {
  pool: Pool;
  databaseId: string;
  k8sApiUrl: string | null;
}

export type ProvisioningHandler = (
  payload: Record<string, unknown>,
  context: ProvisioningContext
) => Promise<Record<string, unknown>>;
