// Types
export type {
  FunctionDefinitionRow,
  NamespaceRow,
  ProvisioningContext,
  ProvisioningHandler,
  SecretRow,
  SyncResourcesPayload,
  SyncResourcesResult,
  SyncSecretsPayload,
  SyncSecretsResult,
} from './types';

// Registry
export {
  getProvisioningHandler,
  registerProvisioningHandler,
} from './registry';

// K8s client + utilities
export { createK8sClient, getK8sClient, isConflict, isNotFound } from './k8s-client';
export { mergeAndReplace } from './k8s-ops';

// Knative builder
export type { KnativeBuilderInput, KnativeServiceSpec } from './knative';
export { buildKnativeServiceSpec, resolveNamespaceName } from './knative';

// Seed
export type { ProvisionSeedOptions, ProvisionSeedResult } from './seed';
export { provision } from './seed';
