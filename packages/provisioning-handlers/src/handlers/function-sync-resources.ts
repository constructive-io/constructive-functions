/**
 * function:sync-resources — updates an existing Knative Service spec
 * when a function definition's resource config changes.
 * Idempotent: replaces the Service spec in-place.
 *
 * Queue handler — triggered by DB trigger on function_definitions UPDATE.
 * Assumes the Knative Service was already created by the seed script.
 */

import { ComputeModuleLoader } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';

import { getK8sClient, isNotFound } from '../k8s-client';
import { buildKnativeServiceSpec, resolveNamespaceName } from '../knative';
import type { ProvisioningContext, ProvisioningHandler } from '../types';

const log = new Logger('provisioning:function-sync');

export const handleFunctionSyncResources: ProvisioningHandler = async (
  payload: Record<string, unknown>,
  context: ProvisioningContext
): Promise<Record<string, unknown>> => {
  const { pool, databaseId } = context;
  const functionId = payload.id as string;

  if (!functionId) {
    throw new Error('function:sync-resources — missing "id" in payload');
  }

  const loader = new ComputeModuleLoader(pool);
  const config = await loader.load(databaseId);
  const publicSchema = config.functionModule?.publicSchema ?? 'constructive_compute_public';
  const definitionsTable = config.functionModule?.definitionsTable ?? 'platform_function_definitions';

  const { rows } = await pool.query(
    `SELECT id, name, task_identifier, service_url, runtime, image,
            concurrency, scale_min, scale_max, timeout_seconds, resources,
            namespace_id
     FROM "${publicSchema}"."${definitionsTable}"
     WHERE id = $1`,
    [functionId]
  );

  if (rows.length === 0) {
    throw new Error(`function:sync-resources — function_definition id=${functionId} not found`);
  }

  const fnRow = rows[0] as Record<string, unknown>;

  if (fnRow.runtime === 'inline' || !fnRow.image) {
    log.info(
      `skipping sync for "${fnRow.name}" — ${fnRow.runtime === 'inline' ? 'inline runtime' : 'no image'}`
    );
    return { skipped: true, reason: fnRow.runtime === 'inline' ? 'inline-runtime' : 'no-image' };
  }

  const client = getK8sClient();
  if (!client) {
    log.info(
      `[dev-mode] would sync Knative Service resources for "${fnRow.name}" — skipping (no K8S_API_URL)`
    );
    return { skipped: true, reason: 'no-k8s' };
  }

  const namespaceName = await resolveNamespaceName(pool, fnRow.namespace_id as string | null);
  const fnName = fnRow.name as string;
  const serviceSpec = buildKnativeServiceSpec(fnRow, namespaceName);

  try {
    // GET the existing service to retrieve metadata required for PUT
    const existing = await client.readServingKnativeDevV1NamespacedService({
      query: {},
      path: { name: fnName, namespace: namespaceName },
    });
    if (serviceSpec.metadata) {
      serviceSpec.metadata.resourceVersion = existing?.metadata?.resourceVersion;
      // Preserve Knative-managed annotations (e.g. serving.knative.dev/creator)
      const existingAnnotations = (existing?.metadata?.annotations ?? {}) as Record<string, string>;
      serviceSpec.metadata.annotations = { ...existingAnnotations, ...serviceSpec.metadata.annotations };
      const existingLabels = (existing?.metadata?.labels ?? {}) as Record<string, string>;
      serviceSpec.metadata.labels = { ...existingLabels, ...serviceSpec.metadata.labels };
    }

    const svc = await client.replaceServingKnativeDevV1NamespacedService({
      query: {},
      path: { name: fnName, namespace: namespaceName },
      body: serviceSpec,
    });

    const serviceUrl = svc?.status?.url ?? svc?.status?.address?.url ?? null;
    log.info(`updated Knative Service "${fnName}" in namespace "${namespaceName}"`);

    if (serviceUrl && serviceUrl !== fnRow.service_url) {
      await pool.query(
        `UPDATE "${publicSchema}"."${definitionsTable}" SET service_url = $1 WHERE id = $2`,
        [serviceUrl, functionId]
      );
      log.info(`updated service_url for "${fnName}" → ${serviceUrl}`);
    }

    return { synced: true, name: fnName, serviceUrl };
  } catch (err: unknown) {
    if (isNotFound(err)) {
      log.warn(
        `Knative Service "${fnName}" not found in "${namespaceName}" — run the provision seed first`
      );
      return { skipped: true, reason: 'service-not-found' };
    }
    throw err;
  }
};
