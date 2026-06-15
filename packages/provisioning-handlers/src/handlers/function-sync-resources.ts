/**
 * Handler: function:sync-resources
 *
 * Queue handler — triggered by DB events on function_definitions UPDATE
 * (scaling changes, image updates, resource adjustments).
 *
 * Reads the updated function definition, rebuilds the Knative Service spec,
 * and replaces it via the merge-and-replace workflow.
 *
 * Assumes the Knative Service already exists (created by the seed).
 */

import { Logger } from '@pgpmjs/logger';

import { getK8sClient } from '../k8s-client';
import { mergeAndReplace } from '../k8s-ops';
import { buildKnativeServiceSpec, resolveNamespaceName } from '../knative';
import type {
  FunctionDefinitionRow,
  ProvisioningHandler,
  SyncResourcesPayload,
  SyncResourcesResult,
} from '../types';

const log = new Logger('provisioning:function-sync-resources');

export const functionSyncResources: ProvisioningHandler<SyncResourcesPayload, SyncResourcesResult> = async (
  payload,
  { pool, databaseId, loader }
) => {
  const functionId = payload.id;

  const client = getK8sClient();
  if (!client) {
    log.info('[dev-mode] skipping function:sync-resources (no K8S_API_URL)');
    return { skipped: true, reason: 'no-k8s' };
  }

  // Resolve table names via shared module loader (TTL-cached instance)
  const config = await loader.load(databaseId);
  const publicSchema = config.functionModule?.publicSchema ?? 'constructive_compute_public';
  const definitionsTable = config.functionModule?.definitionsTable ?? 'platform_function_definitions';

  const { rows } = await pool.query<FunctionDefinitionRow>(
    `SELECT id, name, task_identifier, service_url, runtime, image,
            concurrency, scale_min, scale_max, scale_target, timeout_seconds, resources,
            namespace_id
     FROM "${publicSchema}"."${definitionsTable}"
     WHERE id = $1`,
    [functionId]
  );

  if (rows.length === 0) {
    log.warn(`function definition not found: ${functionId}`);
    return { skipped: true, reason: 'not-found' };
  }

  const fnRow = rows[0];
  if (!fnRow.image || fnRow.runtime === 'inline') {
    log.info(`skipping inline/image-less function: ${fnRow.name}`);
    return { skipped: true, reason: 'inline-or-no-image' };
  }

  const namespaceName = await resolveNamespaceName(pool, fnRow.namespace_id);
  const serviceSpec = buildKnativeServiceSpec(fnRow, namespaceName);

  const svc = await mergeAndReplace(client, serviceSpec, fnRow.name, namespaceName);
  const serviceUrl = (svc?.status as any)?.url ?? (svc?.status as any)?.address?.url ?? null;

  // Write back updated service_url if available
  if (serviceUrl && serviceUrl !== fnRow.service_url) {
    await pool.query(
      `UPDATE "${publicSchema}"."${definitionsTable}" SET service_url = $1 WHERE id = $2`,
      [serviceUrl, fnRow.id]
    );
    log.info(`updated service_url for "${fnRow.name}" → ${serviceUrl}`);
  }

  log.info(`synced Knative Service "${fnRow.name}" in "${namespaceName}"`);
  return { synced: true, name: fnRow.name, serviceUrl };
};
