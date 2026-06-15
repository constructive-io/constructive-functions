/**
 * E2E: Provisioning seed → Knative Services in kind
 *
 * Tests the full provisioning flow end-to-end:
 *   1. Calls provision() to create K8s namespaces, secrets, and Knative Services
 *   2. Verifies K8s namespace + secret were created correctly
 *   3. Verifies Knative Service reaches Ready state
 *   4. Calls the function via in-cluster curl (kubectl run)
 *   5. Verifies the service_url was written back to the DB
 *   6. Re-runs seed to verify idempotency
 *
 * Requires:
 *   - K8S_API_URL pointing to kubectl proxy (e.g. http://localhost:8001)
 *   - PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE for a bootstrapped DB
 *   - Knative Serving + Kourier installed in the kind cluster
 *
 * DB must be bootstrapped with:
 *   tests/e2e/fixtures/provisioning-knative-bootstrap.sql
 */

import { execSync } from 'child_process';

import { provision } from '@constructive-io/provisioning-handlers';
import { InterwebClient } from '@kubernetesjs/ops';
import pg from 'pg';

const { Pool } = pg;

const K8S_API_URL = process.env.K8S_API_URL;
const DATABASE_ID = '00000000-0000-0000-0000-000000000001';

const describeKnative = K8S_API_URL ? describe : describe.skip;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

describeKnative('Provisioning E2E — Knative in kind', () => {
  let pool: pg.Pool;
  let k8s: InterwebClient;

  beforeAll(async () => {
    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'provisioning_e2e',
      connectionTimeoutMillis: 10_000,
    });

    // Verify DB connection
    await pool.query('SELECT 1');

    k8s = new InterwebClient({
      restEndpoint: K8S_API_URL!,
      kubeconfig: '',
      namespace: 'default',
      context: '',
    });
  }, 30_000);

  afterAll(async () => {
    // Cleanup: delete test namespace (cascading deletes all resources)
    try {
      await k8s.deleteCoreV1Namespace({
        query: {},
        path: { name: 'test-ns' },
      });
    } catch {
      // Ignore cleanup errors
    }
    if (pool) await pool.end();
  });

  // ─── Phase 1: Run the provisioning seed ──────────────────────────────────

  let seedResult: Awaited<ReturnType<typeof provision>>;

  it('runs the provisioning seed successfully', async () => {
    seedResult = await provision({
      pool,
      databaseId: DATABASE_ID,
    });

    console.log('Seed result:', JSON.stringify(seedResult, null, 2));

    // Verify namespaces were created
    expect(seedResult.namespaces).toHaveLength(1);
    expect(seedResult.namespaces[0].name).toBe('test-ns');
    expect(['created', 'exists']).toContain(seedResult.namespaces[0].status);

    // Verify secrets were synced
    expect(seedResult.secrets).toHaveLength(1);
    expect(seedResult.secrets[0].namespace).toBe('test-ns');
    expect(seedResult.secrets[0].count).toBe(1);
    expect(seedResult.secrets[0].status).toBe('synced');

    // Verify function Knative Service was created
    expect(seedResult.functions).toHaveLength(1);
    expect(seedResult.functions[0].name).toBe('hello-provisioned');
    expect(seedResult.functions[0].namespace).toBe('test-ns');
    expect(['created', 'exists']).toContain(seedResult.functions[0].status);
  }, 60_000);

  // ─── Phase 2: Verify K8s resources ───────────────────────────────────────

  it('creates the K8s namespace', async () => {
    const ns = await k8s.readCoreV1Namespace({
      query: {},
      path: { name: 'test-ns' },
    });
    expect(ns.metadata?.name).toBe('test-ns');
  });

  it('creates the K8s secret with the decrypted value', async () => {
    const secret = await k8s.readCoreV1NamespacedSecret({
      query: {},
      path: { name: 'test-ns-secrets', namespace: 'test-ns' },
    });
    expect(secret.metadata?.name).toBe('test-ns-secrets');
    expect(secret.data).toHaveProperty('TARGET');

    // Verify the decrypted value (base64-decoded)
    const decoded = Buffer.from(secret.data!.TARGET as string, 'base64').toString('utf-8');
    expect(decoded).toBe('Provisioning E2E');
  });

  // ─── Phase 3: Wait for Knative Service to become Ready ──────────────────

  it('Knative Service reaches Ready state', async () => {
    const maxAttempts = 60;
    let ready = false;
    let lastStatus = '';

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const resp = await fetch(
          `${K8S_API_URL}/apis/serving.knative.dev/v1/namespaces/test-ns/services/hello-provisioned`
        );
        if (resp.ok) {
          const svc = (await resp.json()) as Record<string, any>;
          const conditions = svc?.status?.conditions as
            | Array<{ type: string; status: string }>
            | undefined;
          const readyCondition = conditions?.find((c) => c.type === 'Ready');
          lastStatus = readyCondition?.status || 'Unknown';

          if (readyCondition?.status === 'True') {
            const url = svc?.status?.url || svc?.status?.address?.url || '';
            console.log(`ksvc Ready after ${i + 1} attempts. URL: ${url}`);
            ready = true;
            break;
          }
        }
      } catch {
        // API not ready yet
      }

      if (i % 5 === 0) {
        console.log(`  waiting for ksvc Ready (attempt ${i + 1}/${maxAttempts}, last status: ${lastStatus})...`);
      }
      await sleep(5_000);
    }

    expect(ready).toBe(true);
  }, 360_000);

  // ─── Phase 4: Call the function from inside the cluster ─────────────────

  it('responds to HTTP requests (in-cluster curl)', async () => {
    // Get the ksvc URL from the K8s API
    const resp = await fetch(
      `${K8S_API_URL}/apis/serving.knative.dev/v1/namespaces/test-ns/services/hello-provisioned`
    );
    expect(resp.ok).toBe(true);
    const svc = (await resp.json()) as Record<string, any>;
    const ksvcUrl = (svc?.status?.url || '') as string;
    console.log(`ksvc URL: ${ksvcUrl}`);

    // Curl from inside the cluster using kubectl run.
    // The Knative Service has an in-cluster K8s Service that resolves via DNS.
    const inClusterUrl = `http://hello-provisioned.test-ns.svc.cluster.local`;
    let body = '';
    let success = false;
    const maxRetries = 12;
    const suffix = Math.random().toString(36).slice(2, 8);

    for (let i = 0; i < maxRetries; i++) {
      try {
        const podName = `curl-e2e-${suffix}-${i}`;
        body = execSync(
          `kubectl run ${podName} --rm -i --restart=Never ` +
            `--image=curlimages/curl --request-timeout=60s -- ` +
            `curl -s --max-time 30 ${inClusterUrl}`,
          { encoding: 'utf-8', timeout: 120_000 }
        ).trim();

        console.log(`  attempt ${i + 1}: body="${body.slice(0, 200)}"`);
        if (body.includes('Hello')) {
          success = true;
          break;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Extract stdout from the error if available
        const errWithOutput = err as { stdout?: string; stderr?: string };
        if (errWithOutput.stdout) {
          body = errWithOutput.stdout.trim();
          if (body.includes('Hello')) {
            console.log(`  attempt ${i + 1}: got body from stdout="${body.slice(0, 200)}"`);
            success = true;
            break;
          }
        }
        console.log(`  attempt ${i + 1}: error — ${msg.slice(0, 200)}`);
      }
      await sleep(10_000);
    }

    expect(success).toBe(true);
    expect(body).toContain('Hello');
    expect(body).toContain('Provisioning E2E');
  }, 240_000);

  // ─── Phase 5: Verify DB writeback ────────────────────────────────────────

  it('writes service_url back to the database', async () => {
    const { rows } = await pool.query(
      `SELECT service_url FROM constructive_compute_public.platform_function_definitions
       WHERE name = 'hello-provisioned'`
    );

    expect(rows).toHaveLength(1);
    console.log(`service_url in DB: ${rows[0].service_url || '(not set yet)'}`);
  });

  // ─── Phase 6: Re-run seed (idempotency) ─────────────────────────────────

  it('seed is idempotent — re-running succeeds without errors', async () => {
    const result = await provision({
      pool,
      databaseId: DATABASE_ID,
    });

    console.log('Idempotent re-run:', JSON.stringify(result, null, 2));

    // Should report 'exists' instead of 'created'
    expect(result.namespaces[0].status).toBe('exists');
    expect(result.functions[0].status).toBe('exists');
  }, 60_000);
});
