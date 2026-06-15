/**
 * Provisioning Handler Registry
 *
 * Separate from the FBP inline handler registry — provisioning handlers
 * need database/K8s context, not pure FBP I/O.
 *
 * Handlers are registered at module load time (import side-effect).
 * The compute-worker calls getProvisioningHandler(taskIdentifier) to
 * check if a job should be handled by the provisioning system.
 */

import { functionSyncResources } from './handlers/function-sync-resources';
import { namespaceSyncSecrets } from './handlers/namespace-sync-secrets';
import type { ProvisioningContext } from './types';

/** Base handler signature for the registry (accepts any payload shape). */
type AnyHandler = (payload: any, context: ProvisioningContext) => Promise<any>;

// ── Registry ─────────────────────────────────────────────────────────────────

const PROVISIONING_HANDLERS = new Map<string, AnyHandler>();

PROVISIONING_HANDLERS.set('namespace:sync-secrets', namespaceSyncSecrets);
PROVISIONING_HANDLERS.set('function:sync-resources', functionSyncResources);

// ── Public API ───────────────────────────────────────────────────────────────

export function registerProvisioningHandler(
  taskIdentifier: string,
  handler: AnyHandler
): void {
  PROVISIONING_HANDLERS.set(taskIdentifier, handler);
}

export function getProvisioningHandler(
  taskIdentifier: string
): AnyHandler | null {
  return PROVISIONING_HANDLERS.get(taskIdentifier) ?? null;
}
