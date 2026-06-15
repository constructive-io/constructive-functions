/**
 * Shared Knative Service helpers — used by both the seed script
 * and the function:sync-resources queue handler.
 */

import type { Pool } from 'pg';

/**
 * Build the Knative Service spec from a function definition row.
 */
export function buildKnativeServiceSpec(
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
    metadata: { name: fnName, namespace: namespaceName } as {
      name: string;
      namespace: string;
      resourceVersion?: string;
      annotations?: Record<string, string>;
      labels?: Record<string, string>;
    },
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

/**
 * Resolve a namespace name from a namespace_id. Returns 'default' if null.
 */
export async function resolveNamespaceName(
  pool: Pool,
  namespaceId: string | null
): Promise<string> {
  if (!namespaceId) return 'default';

  const { rows } = await pool.query(
    `SELECT name FROM metaschema_public.namespace WHERE id = $1`,
    [namespaceId]
  );
  return rows.length > 0 ? (rows[0].name as string) : 'default';
}
