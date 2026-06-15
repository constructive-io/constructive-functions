/**
 * Shared Knative Service helpers — used by both the seed script
 * and the function:sync-resources queue handler.
 *
 * Spec shape mirrors constructive-cloud's Go operator
 * (operator/internal/resources/knative.go) so the two systems
 * produce functionally identical Knative Services.
 */

import type { Pool } from 'pg';

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PORT = 8080;
const DEFAULT_TIMEOUT = 300;
const DEFAULT_SCALE_TARGET = 50;
const MANAGED_BY = 'provisioning-handlers';

// ── Types ────────────────────────────────────────────────────────────────────

export interface KnativeServiceSpec {
  apiVersion: 'serving.knative.dev/v1';
  kind: 'Service';
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
    resourceVersion?: string;
  };
  spec: {
    template: {
      metadata: {
        labels: Record<string, string>;
        annotations?: Record<string, string>;
      };
      spec: {
        containerConcurrency?: number;
        timeoutSeconds: number;
        containers: Array<{
          image: string;
          ports: Array<{ containerPort: number }>;
          envFrom: Array<{ secretRef: { name: string } }>;
          resources?: Record<string, unknown>;
          volumeMounts: Array<{ name: string; mountPath: string }>;
        }>;
        volumes: Array<{ name: string; emptyDir: Record<string, never> }>;
      };
    };
  };
}

// ── Labels (matches operator/internal/util/labels.go) ────────────────────────

function componentLabels(namespaceName: string, fnName: string): Record<string, string> {
  return {
    'app.kubernetes.io/managed-by': MANAGED_BY,
    'app.kubernetes.io/part-of': namespaceName,
    'app.kubernetes.io/component': 'function',
    'app.kubernetes.io/name': fnName,
    'app.kubernetes.io/instance': `${namespaceName}-${fnName}`,
    'networking.knative.dev/visibility': 'cluster-local',
  };
}

// ── Builder ──────────────────────────────────────────────────────────────────

/**
 * Build a Knative Service spec from a function definition row.
 *
 * Mirrors the operator's `BuildKnativeService()`:
 *   - Standard k8s labels + cluster-local visibility
 *   - Autoscaling annotations (minScale, maxScale, target)
 *   - Explicit containerPort
 *   - /tmp emptyDir volume (writable scratch space)
 *   - envFrom bulk secret ref
 */
export function buildKnativeServiceSpec(
  fnRow: Record<string, unknown>,
  namespaceName: string
): KnativeServiceSpec {
  const fnName = fnRow.name as string;
  const image = fnRow.image as string;
  const concurrency = (fnRow.concurrency as number) ?? 0;
  const scaleMin = (fnRow.scale_min as number) ?? 0;
  const scaleMax = (fnRow.scale_max as number) ?? 0;
  const scaleTarget = (fnRow.scale_target as number) ?? 0;
  const timeoutSeconds = (fnRow.timeout_seconds as number) ?? DEFAULT_TIMEOUT;
  const resources = (fnRow.resources as Record<string, unknown>) ?? {};

  // Template-level autoscaling annotations
  const templateAnnotations: Record<string, string> = {};
  if (scaleMin > 0) templateAnnotations['autoscaling.knative.dev/minScale'] = String(scaleMin);
  if (scaleMax > 0) templateAnnotations['autoscaling.knative.dev/maxScale'] = String(scaleMax);
  if (scaleTarget > 0 || (scaleMin > 0 && scaleMax > 0)) {
    templateAnnotations['autoscaling.knative.dev/target'] = String(scaleTarget || DEFAULT_SCALE_TARGET);
  }

  const labels = componentLabels(namespaceName, fnName);

  const container: KnativeServiceSpec['spec']['template']['spec']['containers'][0] = {
    image,
    ports: [{ containerPort: DEFAULT_PORT }],
    envFrom: [{ secretRef: { name: `${namespaceName}-secrets` } }],
    volumeMounts: [{ name: 'tmp', mountPath: '/tmp' }],
  };

  if (Object.keys(resources).length > 0) {
    container.resources = resources;
  }

  return {
    apiVersion: 'serving.knative.dev/v1',
    kind: 'Service',
    metadata: {
      name: fnName,
      namespace: namespaceName,
      labels: { ...labels },
      annotations: {},
    },
    spec: {
      template: {
        metadata: {
          labels: { ...labels },
          annotations: Object.keys(templateAnnotations).length > 0 ? templateAnnotations : undefined,
        },
        spec: {
          containerConcurrency: concurrency || undefined,
          timeoutSeconds,
          containers: [container],
          volumes: [{ name: 'tmp', emptyDir: {} }],
        },
      },
    },
  };
}

// ── Namespace resolver ───────────────────────────────────────────────────────

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
