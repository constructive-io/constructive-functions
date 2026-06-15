/**
 * ProvisioningRegistry — built-in task handlers that create K8s
 * infrastructure (namespaces, secrets, Knative Services) when
 * function definitions are inserted/updated in the database.
 *
 * Separate from the FBP inline registry. Provisioning handlers need
 * pool access, K8s client access, and the full job context.
 */

import type { ProvisioningHandler } from './types';

import { handleFunctionProvision } from './handlers/function-provision';
import { handleFunctionSyncResources } from './handlers/function-sync-resources';
import { handleNamespaceProvision } from './handlers/namespace-provision';
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

// Register all built-in provisioning handlers at module load time
registerProvisioningHandler('namespace:provision', handleNamespaceProvision);
registerProvisioningHandler('namespace:sync-secrets', handleNamespaceSyncSecrets);
registerProvisioningHandler('function:provision', handleFunctionProvision);
registerProvisioningHandler('function:sync-resources', handleFunctionSyncResources);
