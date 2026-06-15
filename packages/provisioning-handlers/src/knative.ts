/**
 * Shared Knative Service helpers — used by both the seed script
 * and the function:sync-resources queue handler.
 *
 * Spec shape mirrors constructive-cloud's Go operator
 * (operator/internal/resources/knative.go) so the two systems
 * produce functionally identical Knative Services.
 *
 * Uses types from @kubernetesjs/ops directly — no hand-rolled interfaces.
 */

import type { ServingKnativeDevV1Service } from '@kubernetesjs/ops';
import type { Pool } from 'pg';

import type { FunctionDefinitionRow, NamespaceRow } from './types';

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PORT = 8080;
const DEFAULT_TIMEOUT = 300;
const DEFAULT_SCALE_TARGET = 50;
const MANAGED_BY = 'provisioning-handlers';

// ── Re-export the library type for downstream convenience ────────────────────

export type { ServingKnativeDevV1Service as KnativeServiceSpec } from '@kubernetesjs/ops';

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

/** Fields required from a function_definitions row to build a ksvc spec. */
export type KnativeBuilderInput = Pick<
  FunctionDefinitionRow,
  'name' | 'image' | 'concurrency' | 'scale_min' | 'scale_max' | 'scale_target' | 'timeout_seconds' | 'resources'
>;

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
  fn: KnativeBuilderInput,
  namespaceName: string
): ServingKnativeDevV1Service {
  const concurrency = fn.concurrency ?? 0;
  const scaleMin = fn.scale_min ?? 0;
  const scaleMax = fn.scale_max ?? 0;
  const scaleTarget = fn.scale_target ?? 0;
  const timeoutSeconds = fn.timeout_seconds ?? DEFAULT_TIMEOUT;
  const resources = fn.resources ?? {};

  // Template-level autoscaling annotations
  const templateAnnotations: Record<string, string> = {};
  if (scaleMin > 0) templateAnnotations['autoscaling.knative.dev/minScale'] = String(scaleMin);
  if (scaleMax > 0) templateAnnotations['autoscaling.knative.dev/maxScale'] = String(scaleMax);
  if (scaleTarget > 0 || (scaleMin > 0 && scaleMax > 0)) {
    templateAnnotations['autoscaling.knative.dev/target'] = String(scaleTarget || DEFAULT_SCALE_TARGET);
  }

  const labels = componentLabels(namespaceName, fn.name);

  return {
    apiVersion: 'serving.knative.dev/v1',
    kind: 'Service',
    metadata: {
      name: fn.name,
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
          containers: [
            {
              image: fn.image!,
              ports: [{ containerPort: DEFAULT_PORT }],
              envFrom: [{ secretRef: { name: `${namespaceName}-secrets` } }],
              resources: Object.keys(resources).length > 0 ? resources as any : undefined,
              volumeMounts: [{ name: 'tmp', mountPath: '/tmp' }],
            },
          ],
          volumes: [{ name: 'tmp', emptyDir: {} }],
        },
      },
    },
  };
}

// ── Namespace resolver ───────────────────────────────────────────────────────

/**
 * Resolve a namespace name from a namespace_id. Returns 'default' if null.
 * Accepts optional schema/table for module-loader-resolved table locations.
 */
export async function resolveNamespaceName(
  pool: Pool,
  namespaceId: string | null,
  nsSchema = 'constructive_infra_public',
  nsTable = 'platform_namespaces'
): Promise<string> {
  if (!namespaceId) return 'default';

  const { rows } = await pool.query<NamespaceRow>(
    `SELECT id, name FROM "${nsSchema}"."${nsTable}" WHERE id = $1`,
    [namespaceId]
  );
  return rows.length > 0 ? rows[0].name : 'default';
}
