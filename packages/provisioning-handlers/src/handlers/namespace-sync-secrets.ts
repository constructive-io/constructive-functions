/**
 * Handler: namespace:sync-secrets
 *
 * Queue handler — triggered by DB events on namespace_secret INSERT/UPDATE/DELETE.
 * Reads all secrets for a namespace, decrypts them, and creates/replaces
 * the aggregate K8s Secret in the namespace.
 *
 * Assumes the K8s namespace already exists (created by the seed).
 */

import type { Secret } from '@kubernetesjs/ops';
import { Logger } from '@pgpmjs/logger';

import { getK8sClient, isConflict } from '../k8s-client';
import type {
  NamespaceRow,
  ProvisioningHandler,
  SecretRow,
  SyncSecretsPayload,
  SyncSecretsResult,
} from '../types';

const log = new Logger('provisioning:namespace-sync-secrets');

export const namespaceSyncSecrets: ProvisioningHandler<SyncSecretsPayload, SyncSecretsResult> = async (
  payload,
  { pool }
) => {
  const namespaceId = payload.id;
  const namespaceName = payload.namespace_name;

  const client = getK8sClient();
  if (!client) {
    log.info('[dev-mode] skipping namespace:sync-secrets (no K8S_API_URL)');
    return { skipped: true, reason: 'no-k8s' };
  }

  // Resolve namespace name from ID if not provided directly
  let resolvedName: string;
  let resolvedId: string | undefined;
  if (namespaceName) {
    resolvedName = namespaceName;
    if (!namespaceId) {
      const { rows } = await pool.query<NamespaceRow>(
        `SELECT id, name FROM metaschema_public.namespace WHERE name = $1`,
        [namespaceName]
      );
      if (rows.length === 0) return { skipped: true, reason: 'namespace-not-found' };
      resolvedId = rows[0].id;
    } else {
      resolvedId = namespaceId;
    }
  } else if (namespaceId) {
    resolvedId = namespaceId;
    const { rows } = await pool.query<NamespaceRow>(
      `SELECT id, name FROM metaschema_public.namespace WHERE id = $1`,
      [namespaceId]
    );
    if (rows.length === 0) return { skipped: true, reason: 'namespace-not-found' };
    resolvedName = rows[0].name;
  } else {
    return { skipped: true, reason: 'missing-id-and-name' };
  }

  // Fetch and decrypt secrets
  const { rows: secretRows } = await pool.query<SecretRow>(
    `SELECT key, pgp_sym_decrypt(value, key_id::text) AS decrypted_value
     FROM metaschema_public.namespace_secret
     WHERE namespace_id = $1`,
    [resolvedId]
  );

  const secretData: Record<string, string> = {};
  for (const row of secretRows) {
    secretData[row.key] = Buffer.from(row.decrypted_value).toString('base64');
  }

  const secretName = `${resolvedName}-secrets`;
  const secretBody: Secret = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: { name: secretName },
    data: secretData,
    type: 'Opaque',
  };

  try {
    await client.createCoreV1NamespacedSecret({
      query: {},
      path: { namespace: resolvedName },
      body: secretBody,
    });
    log.info(`created K8s secret "${secretName}" with ${secretRows.length} key(s)`);
  } catch (err: unknown) {
    if (isConflict(err)) {
      await client.replaceCoreV1NamespacedSecret({
        query: {},
        path: { name: secretName, namespace: resolvedName },
        body: secretBody,
      });
      log.info(`replaced K8s secret "${secretName}" with ${secretRows.length} key(s)`);
    } else {
      throw err;
    }
  }

  return { synced: true, secretCount: secretRows.length };
};
