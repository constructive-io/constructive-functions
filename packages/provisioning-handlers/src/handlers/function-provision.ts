/**
 * function:provision — creates a Knative Service for a function
 * definition. Inline functions and those without an image are skipped.
 * Writes the resulting service_url back to function_definitions.
 * Idempotent: handles 409 Conflict.
 */

import { ComputeModuleLoader } from '@constructive-io/module-loader';
import { InterwebClient } from '@kubernetesjs/ops';
import { Logger } from '@pgpmjs/logger';

import type { ProvisioningContext, ProvisioningHandler } from '../types';

const log = new Logger('provisioning:function');

/**
 * Build the Knative Service spec from a function definition row.
 */
function buildKnativeService(
  fnRow: Record<string, unknown>,
  namespaceName: string
) {
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

  return {
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
}

export const handleFunctionProvision: ProvisioningHandler = async (
  payload: Record<string, unknown>,
  context: ProvisioningContext
): Promise<Record<string, unknown>> => {
  const { pool, databaseId, k8sApiUrl } = context;
  const functionId = payload.id as string;

  if (!functionId) {
    throw new Error('function:provision — missing "id" in payload');
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
    throw new Error(`function:provision — function_definition id=${functionId} not found`);
  }

  const fnRow = rows[0] as Record<string, unknown>;

  // Skip inline functions or those without an image
  if (fnRow.runtime === 'inline' || !fnRow.image) {
    log.info(
      `skipping function "${fnRow.name}" — ${fnRow.runtime === 'inline' ? 'inline runtime' : 'no image'}`
    );
    return { skipped: true, reason: fnRow.runtime === 'inline' ? 'inline-runtime' : 'no-image' };
  }

  if (!k8sApiUrl) {
    log.info(
      `[dev-mode] would provision Knative Service for "${fnRow.name}" (image=${fnRow.image}) — skipping (no K8S_API_URL)`
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

  // Ensure namespace exists
  try {
    await client.createCoreV1Namespace({
      query: {},
      body: {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: namespaceName },
      },
    });
    log.info(`ensured K8s namespace "${namespaceName}"`);
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || String(err?.message).includes('AlreadyExists')) {
      // Namespace already exists — fine
    } else {
      throw err;
    }
  }

  // Create Knative Service
  const serviceSpec = buildKnativeService(fnRow, namespaceName);
  let serviceUrl: string | null = null;

  try {
    const svc = await client.createServingKnativeDevV1NamespacedService({
      query: {},
      path: { namespace: namespaceName },
      body: serviceSpec,
    });
    serviceUrl = svc?.status?.url ?? svc?.status?.address?.url ?? null;
    log.info(`created Knative Service "${fnRow.name}" in namespace "${namespaceName}"`);
  } catch (err: any) {
    if (err?.status === 409 || err?.statusCode === 409 || String(err?.message).includes('AlreadyExists')) {
      log.info(`Knative Service "${fnRow.name}" already exists — replacing`);
      const svc = await client.replaceServingKnativeDevV1NamespacedService({
        query: {},
        path: { name: fnRow.name as string, namespace: namespaceName },
        body: serviceSpec,
      });
      serviceUrl = svc?.status?.url ?? svc?.status?.address?.url ?? null;
    } else {
      throw err;
    }
  }

  // Write service_url back to function_definitions
  if (serviceUrl) {
    await pool.query(
      `UPDATE "${publicSchema}"."${definitionsTable}" SET service_url = $1 WHERE id = $2`,
      [serviceUrl, functionId]
    );
    log.info(`updated service_url for "${fnRow.name}" → ${serviceUrl}`);
  }

  return { provisioned: true, name: fnRow.name as string, serviceUrl };
};
