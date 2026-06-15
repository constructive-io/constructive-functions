/**
 * namespace:sync-secrets — reads secrets for a namespace from DB,
 * decrypts them via pgp_sym_decrypt, and syncs to a K8s Secret.
 * Idempotent: creates or replaces the K8s Secret resource.
 *
 * Queue handler — triggered by DB trigger on namespace_secret changes.
 */

import { Logger } from '@pgpmjs/logger';

import { getK8sClient, isConflict } from '../k8s-client';
import type { ProvisioningContext, ProvisioningHandler } from '../types';

const log = new Logger('provisioning:namespace-secrets');

export const handleNamespaceSyncSecrets: ProvisioningHandler = async (
  payload: Record<string, unknown>,
  context: ProvisioningContext
): Promise<Record<string, unknown>> => {
  const { pool } = context;
  const namespaceId = payload.id as string | undefined;
  const namespaceName = payload.namespace_name as string | undefined;

  if (!namespaceId && !namespaceName) {
    throw new Error('namespace:sync-secrets — missing "id" or "namespace_name" in payload');
  }

  // Resolve namespace name from id if not provided directly
  let resolvedName = namespaceName;
  let resolvedId = namespaceId;
  if (!resolvedName && resolvedId) {
    const { rows } = await pool.query(
      `SELECT name FROM metaschema_public.namespace WHERE id = $1`,
      [resolvedId]
    );
    if (rows.length === 0) {
      throw new Error(`namespace:sync-secrets — namespace id=${resolvedId} not found`);
    }
    resolvedName = rows[0].name as string;
  }
  if (!resolvedId && resolvedName) {
    const { rows } = await pool.query(
      `SELECT id FROM metaschema_public.namespace WHERE name = $1`,
      [resolvedName]
    );
    if (rows.length > 0) {
      resolvedId = rows[0].id as string;
    }
  }

  // Read and decrypt secrets for this namespace using pgp_sym_decrypt
  const { rows: secretRows } = await pool.query(
    `SELECT key, pgp_sym_decrypt(value, key_id::text) AS decrypted_value
     FROM metaschema_public.namespace_secret
     WHERE namespace_id = $1`,
    [resolvedId]
  );

  const secretData: Record<string, string> = {};
  for (const row of secretRows) {
    secretData[row.key as string] = Buffer.from(row.decrypted_value as string).toString('base64');
  }

  const client = getK8sClient();
  if (!client) {
    log.info(
      `[dev-mode] would sync ${secretRows.length} secret(s) for namespace "${resolvedName}" — skipping (no K8S_API_URL)`
    );
    return { skipped: true, reason: 'no-k8s' };
  }

  const secretName = `${resolvedName}-secrets`;
  const secretBody = {
    apiVersion: 'v1' as const,
    kind: 'Secret' as const,
    metadata: { name: secretName },
    data: secretData,
    type: 'Opaque',
  };

  try {
    await client.createCoreV1NamespacedSecret({
      query: {},
      path: { namespace: resolvedName! },
      body: secretBody,
    });
    log.info(`created K8s secret "${secretName}" in namespace "${resolvedName}" with ${secretRows.length} key(s)`);
  } catch (err: unknown) {
    if (isConflict(err)) {
      log.info(`K8s secret "${secretName}" already exists — replacing`);
      await client.replaceCoreV1NamespacedSecret({
        query: {},
        path: { name: secretName, namespace: resolvedName! },
        body: secretBody,
      });
      log.info(`replaced K8s secret "${secretName}" in namespace "${resolvedName}"`);
    } else {
      throw err;
    }
  }

  return { synced: true, secretCount: secretRows.length };
};
