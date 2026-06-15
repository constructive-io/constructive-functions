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
 *
 * Decomposed into per-step functions following express-context conventions
 * (one concern per function, typed rows, no giant monoliths).
 */

import type { InterwebClient, Namespace, Secret, ServingKnativeDevV1Service } from '@kubernetesjs/ops';
import { ComputeModuleLoader } from '@constructive-io/module-loader';
import { Logger } from '@pgpmjs/logger';
import type { Pool } from 'pg';

import { getK8sClient, isConflict } from './k8s-client';
import { mergeAndReplace } from './k8s-ops';
import { buildKnativeServiceSpec, resolveNamespaceName } from './knative';
import type { FunctionDefinitionRow, NamespaceRow, SecretRow } from './types';

const log = new Logger('provisioning:seed');

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

// ── Step: Provision Namespaces ───────────────────────────────────────────────

async function provisionNamespaces(
  client: InterwebClient,
  pool: Pool,
  filterNs?: string
): Promise<{ rows: NamespaceRow[]; results: ProvisionSeedResult['namespaces'] }> {
  const nsQuery = filterNs
    ? `SELECT id, name FROM metaschema_public.namespace WHERE name = $1`
    : `SELECT id, name FROM metaschema_public.namespace`;
  const nsParams = filterNs ? [filterNs] : [];
  const { rows } = await pool.query<NamespaceRow>(nsQuery, nsParams);

  const results: ProvisionSeedResult['namespaces'] = [];

  for (const ns of rows) {
    try {
      await client.createCoreV1Namespace({
        query: {},
        body: {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: ns.name },
        } as Namespace,
      });
      log.info(`created K8s namespace "${ns.name}"`);
      results.push({ name: ns.name, status: 'created' });
    } catch (err: unknown) {
      if (isConflict(err)) {
        log.info(`K8s namespace "${ns.name}" already exists`);
        results.push({ name: ns.name, status: 'exists' });
      } else {
        throw err;
      }
    }
  }

  return { rows, results };
}

// ── Step: Sync Secrets ───────────────────────────────────────────────────────

async function syncNamespaceSecrets(
  client: InterwebClient,
  pool: Pool,
  namespaceRows: NamespaceRow[]
): Promise<ProvisionSeedResult['secrets']> {
  const results: ProvisionSeedResult['secrets'] = [];

  for (const ns of namespaceRows) {
    const { rows: secretRows } = await pool.query<SecretRow>(
      `SELECT key, pgp_sym_decrypt(value, key_id::text) AS decrypted_value
       FROM metaschema_public.namespace_secret
       WHERE namespace_id = $1`,
      [ns.id]
    );

    if (secretRows.length === 0) {
      results.push({ namespace: ns.name, count: 0, status: 'skipped' });
      continue;
    }

    const secretData: Record<string, string> = {};
    for (const row of secretRows) {
      secretData[row.key] = Buffer.from(row.decrypted_value).toString('base64');
    }

    const secretName = `${ns.name}-secrets`;
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
        path: { namespace: ns.name },
        body: secretBody,
      });
      log.info(`created K8s secret "${secretName}" with ${secretRows.length} key(s)`);
    } catch (err: unknown) {
      if (isConflict(err)) {
        await client.replaceCoreV1NamespacedSecret({
          query: {},
          path: { name: secretName, namespace: ns.name },
          body: secretBody,
        });
        log.info(`replaced K8s secret "${secretName}" with ${secretRows.length} key(s)`);
      } else {
        throw err;
      }
    }
    results.push({ namespace: ns.name, count: secretRows.length, status: 'synced' });
  }

  return results;
}

// ── Step: Provision Functions ─────────────────────────────────────────────────

async function provisionFunctions(
  client: InterwebClient,
  pool: Pool,
  databaseId: string,
  filterFn?: string
): Promise<ProvisionSeedResult['functions']> {
  const loader = new ComputeModuleLoader(pool);
  const config = await loader.load(databaseId);
  const publicSchema = config.functionModule?.publicSchema ?? 'constructive_compute_public';
  const definitionsTable = config.functionModule?.definitionsTable ?? 'platform_function_definitions';

  let fnQuery = `SELECT id, name, task_identifier, service_url, runtime, image,
                        concurrency, scale_min, scale_max, scale_target, timeout_seconds, resources,
                        namespace_id
                 FROM "${publicSchema}"."${definitionsTable}"
                 WHERE image IS NOT NULL AND runtime != 'inline'`;
  const fnParams: string[] = [];
  if (filterFn) {
    fnQuery += ` AND name = $1`;
    fnParams.push(filterFn);
  }

  const { rows: fnRows } = await pool.query<FunctionDefinitionRow>(fnQuery, fnParams);
  const results: ProvisionSeedResult['functions'] = [];

  for (const fnRow of fnRows) {
    const namespaceName = await resolveNamespaceName(pool, fnRow.namespace_id);

    // Ensure namespace exists (may not have been in the namespace table)
    try {
      await client.createCoreV1Namespace({
        query: {},
        body: {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: namespaceName },
        } as Namespace,
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
      serviceUrl = (svc?.status as any)?.url ?? (svc?.status as any)?.address?.url ?? null;
      log.info(`created Knative Service "${fnRow.name}" in "${namespaceName}"`);
      results.push({ name: fnRow.name, namespace: namespaceName, serviceUrl, status: 'created' });
    } catch (err: unknown) {
      if (isConflict(err)) {
        const svc = await mergeAndReplace(client, serviceSpec, fnRow.name, namespaceName);
        serviceUrl = (svc?.status as any)?.url ?? (svc?.status as any)?.address?.url ?? null;
        log.info(`replaced Knative Service "${fnRow.name}" in "${namespaceName}"`);
        results.push({ name: fnRow.name, namespace: namespaceName, serviceUrl, status: 'exists' });
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
      log.info(`updated service_url for "${fnRow.name}" → ${serviceUrl}`);
    }
  }

  return results;
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

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

  const { rows: namespaceRows, results: nsResults } = await provisionNamespaces(client, pool, filterNs);
  result.namespaces = nsResults;

  result.secrets = await syncNamespaceSecrets(client, pool, namespaceRows);

  result.functions = await provisionFunctions(client, pool, databaseId, filterFn);

  log.info(`seed complete: ${result.namespaces.length} namespace(s), ${result.secrets.length} secret set(s), ${result.functions.length} function(s)`);
  return result;
}
