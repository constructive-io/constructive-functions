/**
 * namespace:provision — creates a K8s namespace when a namespace row
 * is inserted in the database. Idempotent: handles 409 Conflict.
 */

import { InterwebClient } from '@kubernetesjs/ops';
import { Logger } from '@pgpmjs/logger';

import type { ProvisioningContext, ProvisioningHandler } from '../types';

const log = new Logger('provisioning:namespace');

export const handleNamespaceProvision: ProvisioningHandler = async (
  payload: Record<string, unknown>,
  context: ProvisioningContext
): Promise<Record<string, unknown>> => {
  const { pool, k8sApiUrl } = context;
  const namespaceId = payload.id as string;

  if (!namespaceId) {
    throw new Error('namespace:provision — missing "id" in payload');
  }

  const { rows } = await pool.query(
    `SELECT id, name FROM metaschema_public.namespace WHERE id = $1`,
    [namespaceId]
  );

  if (rows.length === 0) {
    throw new Error(`namespace:provision — namespace id=${namespaceId} not found`);
  }

  const namespaceName = rows[0].name as string;

  if (!k8sApiUrl) {
    log.info(`[dev-mode] would create K8s namespace "${namespaceName}" — skipping (no K8S_API_URL)`);
    return { skipped: true, reason: 'no-k8s' };
  }

  const client = new InterwebClient({
    restEndpoint: k8sApiUrl,
    kubeconfig: '',
    namespace: 'default',
    context: '',
  });

  try {
    await client.createCoreV1Namespace({
      query: {},
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: namespaceName },
      },
    });
    log.info(`created K8s namespace "${namespaceName}"`);
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || String(err?.message).includes('AlreadyExists')) {
      log.info(`K8s namespace "${namespaceName}" already exists — skipping`);
    } else {
      throw err;
    }
  }

  return { provisioned: true, namespace: namespaceName };
};
