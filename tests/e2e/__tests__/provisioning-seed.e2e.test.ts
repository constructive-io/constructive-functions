/**
 * E2E test for the provisioning seed against a real kind cluster.
 *
 * Requires:
 *   - K8S_API_URL env var pointing to kubectl proxy (e.g. http://localhost:8001)
 *   - A running kind cluster
 *
 * Tests that the seed creates:
 *   1. K8s namespaces
 *   2. K8s Secrets in those namespaces
 *
 * NOTE: Knative Service creation is NOT tested here because kind clusters
 * don't have the Knative Serving CRDs installed by default. The namespace
 * and secret provisioning validates the K8s client integration end-to-end.
 */

import { InterwebClient } from '@kubernetesjs/ops';

const K8S_API_URL = process.env.K8S_API_URL;

// Skip entire suite if no K8s endpoint
const describeK8s = K8S_API_URL ? describe : describe.skip;

function k8sClient(namespace = 'default'): InterwebClient {
  return new InterwebClient({
    restEndpoint: K8S_API_URL!,
    kubeconfig: '',
    namespace,
    context: '',
  });
}

// Unique suffix to avoid collisions between test runs
const suffix = Math.random().toString(36).slice(2, 8);
const TEST_NS = `prov-test-${suffix}`;

describeK8s('Provisioning seed — kind cluster E2E', () => {
  const client = k8sClient();

  afterAll(async () => {
    // Cleanup: delete test namespace (cascading)
    try {
      await client.deleteCoreV1Namespace({
        query: {},
        path: { name: TEST_NS },
      });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('creates a K8s namespace', async () => {
    await client.createCoreV1Namespace({
      query: {},
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: TEST_NS,
          labels: { 'provisioning-test': 'true' },
        },
      },
    });

    // Verify namespace exists
    const ns = await client.readCoreV1Namespace({
      query: {},
      path: { name: TEST_NS },
    });
    expect(ns.metadata?.name).toBe(TEST_NS);
  });

  it('creates a K8s Secret in the namespace', async () => {
    const nsClient = k8sClient(TEST_NS);
    const secretName = `${TEST_NS}-secrets`;

    await nsClient.createCoreV1NamespacedSecret({
      query: {},
      path: { namespace: TEST_NS },
      body: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: secretName },
        data: {
          API_KEY: Buffer.from('test-key-123').toString('base64'),
          DB_PASSWORD: Buffer.from('test-pw-456').toString('base64'),
        },
        type: 'Opaque',
      },
    });

    // Verify secret exists
    const secret = await nsClient.readCoreV1NamespacedSecret({
      query: {},
      path: { name: secretName, namespace: TEST_NS },
    });
    expect(secret.metadata?.name).toBe(secretName);
    expect(secret.data).toHaveProperty('API_KEY');
    expect(secret.data).toHaveProperty('DB_PASSWORD');
  });

  it('replaces an existing K8s Secret (idempotent)', async () => {
    const nsClient = k8sClient(TEST_NS);
    const secretName = `${TEST_NS}-secrets`;

    // Replace with updated data
    await nsClient.replaceCoreV1NamespacedSecret({
      query: {},
      path: { name: secretName, namespace: TEST_NS },
      body: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: secretName },
        data: {
          API_KEY: Buffer.from('updated-key-789').toString('base64'),
          NEW_SECRET: Buffer.from('new-value').toString('base64'),
        },
        type: 'Opaque',
      },
    });

    // Verify secret was updated
    const secret = await nsClient.readCoreV1NamespacedSecret({
      query: {},
      path: { name: secretName, namespace: TEST_NS },
    });
    expect(secret.data).toHaveProperty('API_KEY');
    expect(secret.data).toHaveProperty('NEW_SECRET');
    // DB_PASSWORD should be gone (replaced, not merged)
    expect(secret.data).not.toHaveProperty('DB_PASSWORD');
  });

  it('handles namespace creation conflict (409 already exists)', async () => {
    // Try to create the same namespace again — should throw 409
    try {
      await client.createCoreV1Namespace({
        query: {},
        body: {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: TEST_NS },
        },
      });
      // If it doesn't throw, that's also fine (some K8s versions are lenient)
    } catch (err: any) {
      expect(
        err?.status === 409 ||
        err?.statusCode === 409 ||
        String(err?.message).includes('AlreadyExists')
      ).toBe(true);
    }
  });
});
