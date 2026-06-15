/**
 * function:sync-resources — updates an existing Knative Service spec
 * when a function definition's resource config changes.
 * Idempotent: replaces the Service spec in-place.
 */

import { ComputeModuleLoader } from '@constructive-io/module-loader';
import { InterwebClient } from '@kubernetesjs/ops';
import { Logger } from '@pgpmjs/logger';

import type { ProvisioningContext, ProvisioningHandler } from '../types';

const log = new Logger('provisioning:function-sync');

export const handleFunctionSyncResources: ProvisioningHandler = async (
  payload: Record<string, unknown>,
  context: ProvisioningContext
): Promise<Record<string, unknown>> => {
  const { pool, databaseId, k8sApiUrl } = context;
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

  if (!k8sApiUrl) {
    log.info(
      `[dev-mode] would sync Knative Service resources for "${fnRow.name}" — skipping (no K8S_API_URL)`
    );
    return { skipped: true, reason: 'no-k8s' };
  }

  // Resolve namespace name
  let namespaceName = 'default';
  if (fnRow.namespace_id) {
    const { rows: nsRows } = await pool.query(
      `SELECT name FROM metaschema_public.namespace WHERE id = $1`,
      [fnRow.namespace_id]
    );
    if (nsRows.length > 0) {
      namespaceName = nsRows[0].name as string;
    }
  }

  const client = new InterwebClient({
    restEndpoint: k8sApiUrl,
    kubeconfig: '',
    namespace: namespaceName,
    context: '',
  });

  const image = fnRow.image as string;
  const concurrency = (fnRow.concurrency as number) ?? 0;
  const scaleMin = (fnRow.scale_min as number) ?? 0;
  const scaleMax = (fnRow.scale_max as number) ?? 0;
  const timeoutSeconds = (fnRow.timeout_seconds as number) ?? 300;
  const resources = (fnRow.resources as Record<string, unknown>) ?? {};
  const fnName = fnRow.name as string;

  const annotations: Record<string, string> = {};
  if (scaleMin > 0) annotations['autoscaling.knative.dev/minScale'] = String(scaleMin);
  if (scaleMax > 0) annotations['autoscaling.knative.dev/maxScale'] = String(scaleMax);

  const serviceSpec = {
    apiVersion: 'serving.knative.dev/v1',
    kind: 'Service',
    metadata: { name: fnName, namespace: namespaceName },
    spec: {
      template: {
        metadata: {
          annotations: Object.keys(annotations).length > 0 ? annotations : undefined,
        },
        spec: {
          containerConcurrency: concurrency || undefined,
          timeoutSeconds,
          containers: [
            {
              image,
              envFrom: [{ secretRef: { name: `${namespaceName}-secrets` } }],
              ...(Object.keys(resources).length > 0 ? { resources } : {}),
            },
          ],
        },
      },
    },
  };

  try {
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
  } catch (err: any) {
    if (err?.status === 404 || err?.statusCode === 404 || String(err?.message).includes('NotFound')) {
      log.warn(
        `Knative Service "${fnName}" not found in "${namespaceName}" — cannot sync (run function:provision first)`
      );
      return { skipped: true, reason: 'service-not-found' };
    }
    throw err;
  }
};
