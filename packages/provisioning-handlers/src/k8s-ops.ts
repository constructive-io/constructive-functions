/**
 * K8s resource operations — shared utilities for create/replace workflows.
 *
 * Extracted from the seed script so handlers can import without
 * depending on the seed module (proper module boundary).
 */

import type { InterwebClient, ServingKnativeDevV1Service } from '@kubernetesjs/ops';

/**
 * GET → merge immutable metadata → PUT.
 *
 * Knative's admission webhook sets immutable annotations
 * (e.g. serving.knative.dev/creator) and K8s requires
 * resourceVersion for optimistic-concurrency on PUT.
 * This helper fetches both from the live object and merges
 * them into the desired spec before replacing.
 */
export async function mergeAndReplace(
  client: InterwebClient,
  spec: ServingKnativeDevV1Service,
  name: string,
  namespace: string
): Promise<ServingKnativeDevV1Service> {
  const existing = await client.readServingKnativeDevV1NamespacedService({
    query: {},
    path: { name, namespace },
  });

  if (spec.metadata) {
    spec.metadata.resourceVersion = existing?.metadata?.resourceVersion;

    const existingAnnotations = (existing?.metadata?.annotations ?? {}) as Record<string, string>;
    spec.metadata.annotations = { ...existingAnnotations, ...(spec.metadata.annotations as Record<string, string>) };

    const existingLabels = (existing?.metadata?.labels ?? {}) as Record<string, string>;
    spec.metadata.labels = { ...existingLabels, ...(spec.metadata.labels as Record<string, string>) };
  }

  return client.replaceServingKnativeDevV1NamespacedService({
    query: {},
    path: { name, namespace },
    body: spec,
  });
}
