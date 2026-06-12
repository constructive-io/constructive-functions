import {
  BillingTracker,
  ComputeLogTracker,
  ComputeModuleLoader,
  compute_request,
  FunctionDiscovery,
  InvocationTracker,
  isGraphNodePayload,
} from '@constructive-io/compute-worker';
import type {
  ComputeJobRow,
  ComputeRequestOptions,
} from '@constructive-io/compute-worker';
import { Pool } from 'pg';

export interface TestWorkerOptions {
  /** The function server URL to dispatch to (e.g. mock server URL) */
  functionUrl: string;
  /** Per-function URL overrides (used for graph node dispatch, keyed by function name) */
  functionUrlMap?: Record<string, string>;
  /** Platform database ID (default: '00000000-0000-0000-0000-000000000000') */
  databaseId?: string;
  /** Worker ID (default: 'test-worker') */
  workerId?: string;
  /** TTL for module config cache in ms (default: 0 = no cache) */
  cacheTtlMs?: number;
}

export interface DispatchResult {
  invocationId: string;
  durationMs: number;
  status: 'completed' | 'failed';
  error?: string;
}

export interface TestWorker {
  /** Dispatch a job through the full compute-worker pipeline */
  dispatchJob: (job: ComputeJobRow) => Promise<DispatchResult>;
  /** Set GUCs on the pool connection for a job (same as the real worker) */
  setJobGUCs: (job: ComputeJobRow) => Promise<void>;
  /** Access the module loader for inspection */
  loader: ComputeModuleLoader;
  /** Access the function discovery for inspection */
  discovery: FunctionDiscovery;
  /** Access the invocation tracker for inspection */
  tracker: InvocationTracker;
  /** Access the compute log tracker for inspection */
  computeLog: ComputeLogTracker;
  /** Access the billing tracker for inspection */
  billing: BillingTracker;
  /** The raw pg.Pool used by the worker (connected to the test DB) */
  pool: Pool;
  /** Tear down the worker pool */
  close: () => Promise<void>;
}

const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Create a test compute-worker that uses real tracker/loader classes
 * but dispatches to a configurable URL (mock server).
 *
 * The worker creates its own pg.Pool connected to the same test database
 * that `getConnections()` created. This pool is used by all the tracker
 * classes (ModuleLoader, FunctionDiscovery, InvocationTracker, etc.)
 * for their SQL queries.
 *
 * @example
 * ```ts
 * const { pg } = await getConnections({ modules: 'all+seeds' });
 * const mockServer = await createMockFunctionServer();
 * const worker = await createTestWorker(pg, { functionUrl: mockServer.url });
 *
 * const result = await worker.dispatchJob({
 *   id: job.id,
 *   task_identifier: 'node-example',
 *   payload: { hello: 'world' },
 *   database_id: dbId,
 *   actor_id: 'user-123',
 * });
 *
 * expect(result.status).toBe('completed');
 * expect(mockServer.requests).toHaveLength(1);
 * expect(mockServer.requests[0].headers['x-actor-id']).toBe('user-123');
 * ```
 */
export async function createTestWorker(
  pgClient: { config: { host: string; port: number; database: string; user: string; password: string } },
  opts: TestWorkerOptions
): Promise<TestWorker> {
  const databaseId = opts.databaseId ?? DEFAULT_DATABASE_ID;
  const workerId = opts.workerId ?? 'test-worker';
  const cacheTtlMs = opts.cacheTtlMs ?? 0;
  const functionUrl = opts.functionUrl;
  const functionUrlMap = opts.functionUrlMap ?? {};

  const pool = new Pool({
    host: pgClient.config.host ?? 'localhost',
    port: pgClient.config.port ?? 5432,
    database: pgClient.config.database,
    user: pgClient.config.user ?? 'postgres',
    password: pgClient.config.password ?? 'password',
  });

  const loader = new ComputeModuleLoader(pool, cacheTtlMs);
  const discovery = new FunctionDiscovery(pool, loader, databaseId, cacheTtlMs);
  const tracker = new InvocationTracker(pool, loader, databaseId);
  const computeLog = new ComputeLogTracker(pool, loader, databaseId);
  const billing = new BillingTracker(pool, databaseId, cacheTtlMs);

  async function setJobGUCs(job: ComputeJobRow): Promise<void> {
    const gucs: [string, string][] = [];
    const dbId = (job.database_id as string) || databaseId;
    gucs.push(['jwt.claims.database_id', dbId]);
    if (job.actor_id) gucs.push(['jwt.claims.user_id', job.actor_id]);
    if (job.entity_id) gucs.push(['jwt.claims.entity_id', job.entity_id]);
    if (job.organization_id) gucs.push(['jwt.claims.organization_id', job.organization_id]);

    const sets = gucs.map(([k, v]) => `set_config('${k}', '${v}', true)`).join(', ');
    if (sets) {
      await pool.query(`SELECT ${sets}`);
    }
  }

  async function dispatchJob(job: ComputeJobRow): Promise<DispatchResult> {
    const { task_identifier, payload } = job;
    const graphNode = isGraphNodePayload(payload);
    const fnName = graphNode ? payload.node_type : task_identifier;
    const jobDatabaseId = (job.database_id as string) || databaseId;
    const scope = job.entity_id ? 'org' : 'platform';
    const billingEntityId = job.entity_id || job.organization_id;
    const meterSlug = fnName;

    // Resolve function URL: use per-function URL map if provided, else default
    let targetUrl = functionUrl;
    if (graphNode && functionUrlMap[fnName]) {
      targetUrl = functionUrlMap[fnName];
    }

    // For graph nodes, send inputs as HTTP body; for standalone, full payload
    const httpBody = graphNode ? payload.inputs : payload;

    // 1. Set GUCs
    await setJobGUCs(job);

    // 2. Billing quota check
    if (billingEntityId) {
      const allowed = await billing.checkQuota(billingEntityId, meterSlug, 1, jobDatabaseId);
      if (!allowed) {
        throw new Error(`Billing quota exceeded for meter="${meterSlug}" entity=${billingEntityId}`);
      }
    }

    // 3. Create invocation record
    const { id: invocationId } = await tracker.create({
      task_identifier: fnName,
      payload,
      job_id: job.id,
      database_id: jobDatabaseId,
      actor_id: job.actor_id,
      scope,
    });

    // 4. HTTP dispatch
    const reqStart = process.hrtime();
    try {
      const reqOpts: ComputeRequestOptions = {
        body: httpBody,
        database_id: jobDatabaseId,
        actor_id: job.actor_id,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        worker_id: workerId,
        job_id: job.id,
        invocation_id: invocationId,
        ...(graphNode ? {
          execution_id: payload.execution_id,
          node_name: payload.node_name,
        } : {}),
      };
      const result = await compute_request(targetUrl, reqOpts);

      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);

      // 5. Complete invocation
      await tracker.complete(
        invocationId, ms, undefined,
        scope, scope === 'org' ? jobDatabaseId : undefined
      );

      // 6. Record billing usage
      if (billingEntityId) {
        await billing.recordUsage(billingEntityId, meterSlug, 1, {
          task_identifier,
          duration_ms: ms,
          invocation_id: invocationId,
          job_id: String(job.id),
        }, jobDatabaseId);
      }

      // 7. Write compute log
      await computeLog.log({
        task_identifier: fnName,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: jobDatabaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'completed',
        duration_ms: ms,
      });

      // 8. Graph node completion
      if (graphNode) {
        await pool.query(
          `SELECT constructive_compute_private.platform_complete_node($1::uuid, $2, $3::jsonb)`,
          [payload.execution_id, payload.node_name, JSON.stringify(result.body ?? {})]
        );
      }

      return { invocationId, durationMs: ms, status: 'completed' };
    } catch (err: unknown) {
      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      const errorMsg = err instanceof Error ? err.message : String(err);

      await tracker.fail(
        invocationId, ms, errorMsg,
        scope, scope === 'org' ? jobDatabaseId : undefined
      );

      await computeLog.log({
        task_identifier: fnName,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: jobDatabaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'failed',
        duration_ms: ms,
        error: errorMsg,
      });

      // Mark graph execution as failed
      if (graphNode) {
        try {
          await pool.query(
            `UPDATE constructive_compute_private.platform_function_graph_executions
             SET status = 'failed', error_message = $1
             WHERE id = $2`,
            [errorMsg, payload.execution_id]
          );
        } catch { /* best-effort */ }
      }

      return { invocationId, durationMs: ms, status: 'failed', error: errorMsg };
    }
  }

  return {
    dispatchJob,
    setJobGUCs,
    loader,
    discovery,
    tracker,
    computeLog,
    billing,
    pool,
    close: () => pool.end(),
  };
}
