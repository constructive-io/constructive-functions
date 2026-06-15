/**
 * Mock for @kubernetesjs/ops — used in unit/integration tests that
 * don't have a real K8s cluster.
 */

export class InterwebClient {
  constructor(_opts: Record<string, unknown>) {}
  async createCoreV1Namespace(_args: unknown) { return {}; }
  async createCoreV1NamespacedSecret(_args: unknown) { return {}; }
  async replaceCoreV1NamespacedSecret(_args: unknown) { return {}; }
  async createServingKnativeDevV1NamespacedService(_args: unknown) { return { status: { url: 'http://mock-service.local' } }; }
  async replaceServingKnativeDevV1NamespacedService(_args: unknown) { return { status: { url: 'http://mock-service.local' } }; }
}
