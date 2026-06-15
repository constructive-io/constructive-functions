/**
 * ProvisioningRegistry — built-in task handlers that sync K8s
 * infrastructure when database state changes.
 *
 * These handlers run inline in the compute-worker. They assume the
 * underlying K8s resources were already created by the provisioning
 * seed script — they only handle incremental updates.
 */

import type { ProvisioningHandler } from './types';

import { handleFunctionSyncResources } from './handlers/function-sync-resources';
import { handleNamespaceSyncSecrets } from './handlers/namespace-sync-secrets';

const PROVISIONING_HANDLERS = new Map<string, ProvisioningHandler>();

export function registerProvisioningHandler(
  taskIdentifier: string,
  handler: ProvisioningHandler
): void {
  PROVISIONING_HANDLERS.set(taskIdentifier, handler);
}

export function getProvisioningHandler(
  taskIdentifier: string
): ProvisioningHandler | null {
  return PROVISIONING_HANDLERS.get(taskIdentifier) ?? null;
}

// Register sync handlers at module load time
registerProvisioningHandler('namespace:sync-secrets', handleNamespaceSyncSecrets);
registerProvisioningHandler('function:sync-resources', handleFunctionSyncResources);
