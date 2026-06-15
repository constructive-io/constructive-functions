/**
 * Provisioning Seed — creates K8s infrastructure from current DB state.
 *
 * Run manually via CLI when:
 *   - Setting up a new environment
 *   - Onboarding a new namespace
 *   - Deploying a new function for the first time
 *
 * After seed runs, incremental updates flow through the job queue
 * via namespace:sync-secrets and function:sync-resources handlers.
 *
 * Fully idempotent — safe to re-run at any time.
 */

import { ComputeModuleLoader } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { getK8sClient, isConflict } from './k8s-client';
import type { KnativeServiceSpec } from './knative';
import { buildKnativeServiceSpec, resolveNamespaceName } from './knative';

const log = new Logger('provisioning:seed');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * GET → merge immutable metadata → PUT.
 *
 * Knative's admission webhook sets immutable annotations
 * (e.g. serving.knative.dev/creator) and K8s requires
 * resourceVersion for optimistic-concurrency on PUT.
 * This helper fetches both from the live object and merges
 * them into the desired spec before replacing.
 */
export async function mergeAndReplace(
  client: import('@kubernetesjs/ops').InterwebClient,
  spec: KnativeServiceSpec,
  name: string,
  namespace: string
) {
  const existing = await client.readServingKnativeDevV1NamespacedService({
    query: {},
    path: { name, namespace },
  });

  spec.metadata.resourceVersion = existing?.metadata?.resourceVersion;

  const existingAnnotations = (existing?.metadata?.annotations ?? {}) as Record<string, string>;
  spec.metadata.annotations = { ...existingAnnotations, ...spec.metadata.annotations };

  const existingLabels = (existing?.metadata?.labels ?? {}) as Record<string, string>;
  spec.metadata.labels = { ...existingLabels, ...spec.metadata.labels };

  return client.replaceServingKnativeDevV1NamespacedService({
    query: {},
    path: { name, namespace },
    body: spec,
  });
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProvisionSeedOptions {
  pool: Pool;
  databaseId: string;
  /** Provision only this namespace (by name). If omitted, provisions all. */
  namespace?: string;
  /** Provision only this function (by name). If omitted, provisions all. */
  functionName?: string;
}

export interface ProvisionSeedResult {
  namespaces: { name: string; status: 'created' | 'exists' | 'skipped' }[];
  secrets: { namespace: string; count: number; status: 'synced' | 'skipped' }[];
  functions: { name: string; namespace: string; serviceUrl: string | null; status: 'created' | 'exists' | 'skipped' }[];
}

/**
 * Provision all K8s infrastructure from current database state.
 */
export async function provision(opts: ProvisionSeedOptions): Promise<ProvisionSeedResult> {
  const { pool, databaseId, namespace: filterNs, functionName: filterFn } = opts;
  const client = getK8sClient();

  const result: ProvisionSeedResult = {
    namespaces: [],
    secrets: [],
    functions: [],
  };

  if (!client) {
    log.info('[dev-mode] K8S_API_URL not set — skipping all provisioning');
    return result;
  }

  // ─── 1. Provision namespaces ────────────────────────────────────────────

  const nsQuery = filterNs
    ? `SELECT id, name FROM metaschema_public.namespace WHERE name = $1`
    : `SELECT id, name FROM metaschema_public.namespace`;
  const nsParams = filterNs ? [filterNs] : [];
  const { rows: namespaceRows } = await pool.query(nsQuery, nsParams);

  for (const ns of namespaceRows) {
    const nsName = ns.name as string;
    try {
      await client.createCoreV1Namespace({
        query: {},
        body: {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: nsName },
        },
      });
      log.info(`created K8s namespace "${nsName}"`);
      result.namespaces.push({ name: nsName, status: 'created' });
    } catch (err: unknown) {
      if (isConflict(err)) {
        log.info(`K8s namespace "${nsName}" already exists`);
        result.namespaces.push({ name: nsName, status: 'exists' });
      } else {
        throw err;
      }
    }
  }

  // ─── 2. Sync secrets for each namespace ─────────────────────────────────

  for (const ns of namespaceRows) {
    const nsId = ns.id as string;
    const nsName = ns.name as string;

    const { rows: secretRows } = await pool.query(
      `SELECT key, pgp_sym_decrypt(value, key_id::text) AS decrypted_value
       FROM metaschema_public.namespace_secret
       WHERE namespace_id = $1`,
      [nsId]
    );

    if (secretRows.length === 0) {
      result.secrets.push({ namespace: nsName, count: 0, status: 'skipped' });
      continue;
    }

    const secretData: Record<string, string> = {};
    for (const row of secretRows) {
      secretData[row.key as string] = Buffer.from(row.decrypted_value as string).toString('base64');
    }

    const secretName = `${nsName}-secrets`;
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
        path: { namespace: nsName },
        body: secretBody,
      });
      log.info(`created K8s secret "${secretName}" with ${secretRows.length} key(s)`);
    } catch (err: unknown) {
      if (isConflict(err)) {
        await client.replaceCoreV1NamespacedSecret({
          query: {},
          path: { name: secretName, namespace: nsName },
          body: secretBody,
        });
        log.info(`replaced K8s secret "${secretName}" with ${secretRows.length} key(s)`);
      } else {
        throw err;
      }
    }
    result.secrets.push({ namespace: nsName, count: secretRows.length, status: 'synced' });
  }

  // ─── 3. Provision function Knative Services ─────────────────────────────

  const loader = new ComputeModuleLoader(pool);
  const config = await loader.load(databaseId);
  const publicSchema = config.functionModule?.publicSchema ?? 'constructive_compute_public';
  const definitionsTable = config.functionModule?.definitionsTable ?? 'platform_function_definitions';

  let fnQuery = `SELECT id, name, task_identifier, service_url, runtime, image,
                        concurrency, scale_min, scale_max, timeout_seconds, resources,
                        namespace_id
                 FROM "${publicSchema}"."${definitionsTable}"
                 WHERE image IS NOT NULL AND runtime != 'inline'`;
  const fnParams: string[] = [];
  if (filterFn) {
    fnQuery += ` AND name = $1`;
    fnParams.push(filterFn);
  }

  const { rows: fnRows } = await pool.query(fnQuery, fnParams);

  for (const fnRow of fnRows) {
    const fnName = fnRow.name as string;
    const namespaceName = await resolveNamespaceName(pool, fnRow.namespace_id as string | null);

    // Ensure namespace exists (may not have been in the namespace table)
    try {
      await client.createCoreV1Namespace({
        query: {},
        body: {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: namespaceName },
        },
      });
    } catch (err: unknown) {
      if (!isConflict(err)) throw err;
    }

    const serviceSpec = buildKnativeServiceSpec(fnRow, namespaceName);
    let serviceUrl: string | null = null;

    try {
      const svc = await client.createServingKnativeDevV1NamespacedService({
        query: {},
        path: { namespace: namespaceName },
        body: serviceSpec,
      });
      serviceUrl = svc?.status?.url ?? svc?.status?.address?.url ?? null;
      log.info(`created Knative Service "${fnName}" in "${namespaceName}"`);
      result.functions.push({ name: fnName, namespace: namespaceName, serviceUrl, status: 'created' });
    } catch (err: unknown) {
      if (isConflict(err)) {
        const svc = await mergeAndReplace(client, serviceSpec, fnName, namespaceName);
        serviceUrl = svc?.status?.url ?? svc?.status?.address?.url ?? null;
        log.info(`replaced Knative Service "${fnName}" in "${namespaceName}"`);
        result.functions.push({ name: fnName, namespace: namespaceName, serviceUrl, status: 'exists' });
      } else {
        throw err;
      }
    }

    // Write service_url back to DB
    if (serviceUrl) {
      await pool.query(
        `UPDATE "${publicSchema}"."${definitionsTable}" SET service_url = $1 WHERE id = $2`,
        [serviceUrl, fnRow.id]
      );
      log.info(`updated service_url for "${fnName}" → ${serviceUrl}`);
    }
  }

  log.info(`seed complete: ${result.namespaces.length} namespace(s), ${result.secrets.length} secret set(s), ${result.functions.length} function(s)`);
  return result;
}
