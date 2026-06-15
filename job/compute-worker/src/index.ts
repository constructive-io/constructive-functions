/**
 * ComputeWorker — Platform-aware job worker.
 *
 * Discovers functions and tracks invocations using dynamically-resolved
 * schema/table names from metaschema via ComputeModuleLoader.
 *
 * Flow:
 *   1. Poll app_jobs.jobs for the next job
 *   2. Lazy-resolve the function definition from DB (cached)
 *   3. Create an invocation record (status=running) — scope-aware
 *   4. HTTP POST to the function's service_url
 *   5. Update invocation to completed/failed with duration
 */

import poolManager from '@constructive-io/job-pg';
import type { PgClientLike } from '@constructive-io/job-utils';
import * as jobs from '@constructive-io/job-utils';
import type { GraphExecutionModuleConfig } from '@constructive-io/module-loader';
import { ComputeModuleLoader, ModuleLoader } from '@constructive-io/module-loader';
import { getProvisioningHandler } from '@constructive-io/provisioning-handlers';
import { Logger } from '@pgpmjs/logger';
import type { Pool, PoolClient } from 'pg';

import { BillingTracker } from './billing';
import { ComputeLogTracker } from './compute-log';
import { FunctionDiscovery } from './discovery';
import { executeInline, getInlineImpl } from './inline';
import { InvocationTracker } from './invocation';
import { compute_request } from './req';
import type { ComputeJobRow, ComputeWorkerOptions, PlatformFunctionDefinition } from './types';
import { isGraphNodePayload } from './types';

const DEFAULT_DATABASE_ID = '00000000-0000-0000-0000-000000000000';

export { BillingTracker } from './billing';
export { TtlCache } from './cache';
export type { ComputeLogEntry } from './compute-log';
export { ComputeLogTracker } from './compute-log';
export { FunctionDiscovery } from './discovery';
export type { InlineImplFn, InlineNodeDef } from './inline';
export { executeInline, getInlineImpl, listInlineNodes } from './inline';
export { InvocationTracker } from './invocation';
export { ComputeModuleLoader } from './module-loader';
export type { ComputeRequestOptions, ComputeRequestResult } from './req';
export { compute_request } from './req';
export type {
  BillingContext,
  BillingModuleConfig,
  ComputeJobRow,
  ComputeLogModuleConfig,
  ComputeModuleConfig,
  ComputeWorkerOptions,
  CreateInvocationInput,
  FunctionModuleConfig,
  FunctionPortDefinition,
  FunctionRequirement,
  FunctionRuntime,
  GraphExecutionModuleConfig,
  GraphNodePayload,
  InvocationModuleConfig,
  InvocationStatus,
  PlatformFunctionDefinition,
} from './types';
export { isGraphNodePayload } from './types';
export type { ProvisioningContext, ProvisioningHandler } from '@constructive-io/provisioning-handlers';
export { getProvisioningHandler, provision, registerProvisioningHandler } from '@constructive-io/provisioning-handlers';

const log = new Logger('compute:worker');

export default class ComputeWorker {
  idleDelay: number;
  workerId: string;
  pgPool: Pool;
  doNextTimer?: NodeJS.Timeout;
  _initialized?: boolean;
  listenClient?: PoolClient;
  listenRelease?: () => void;
  stopped?: boolean;

  readonly loader: ComputeModuleLoader;
  readonly moduleLoader: ModuleLoader;
  readonly discovery: FunctionDiscovery;
  readonly tracker: InvocationTracker;
  readonly billing: BillingTracker;
  readonly computeLog: ComputeLogTracker;

  private callbackUrl?: string;
  private gatewayUrl?: string;
  private platformDatabaseId: string;

  constructor(opts: ComputeWorkerOptions) {
    this.idleDelay = opts.idleDelay ?? 15_000;
    this.workerId = opts.workerId ?? 'compute-worker-0';
    this.pgPool = opts.pgPool;
    this.platformDatabaseId = opts.databaseId ?? DEFAULT_DATABASE_ID;

    this.loader = new ComputeModuleLoader(this.pgPool, opts.cacheTtlMs);
    this.moduleLoader = new ModuleLoader({ pool: this.pgPool, databaseId: this.platformDatabaseId, cacheTtlMs: opts.cacheTtlMs });
    this.discovery = new FunctionDiscovery(this.pgPool, this.loader, this.platformDatabaseId, opts.cacheTtlMs);
    this.tracker = new InvocationTracker(this.pgPool, this.loader, this.platformDatabaseId);
    this.billing = new BillingTracker(this.pgPool, this.platformDatabaseId, opts.cacheTtlMs);
    this.computeLog = new ComputeLogTracker(this.pgPool, this.loader, this.platformDatabaseId);

    this.callbackUrl = process.env.COMPUTE_CALLBACK_URL
      || process.env.INTERNAL_JOBS_CALLBACK_URL;

    this.gatewayUrl = process.env.COMPUTE_GATEWAY_URL
      || process.env.INTERNAL_GATEWAY_URL;

    poolManager.onClose(async () => {
      await jobs.releaseJobs(this.pgPool, { workerId: this.workerId });
    });
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────

  async initialize(client: PgClientLike): Promise<void> {
    if (this._initialized) return;

    await jobs.releaseJobs(client, { workerId: this.workerId });
    this._initialized = true;

    const fns = await this.discovery.listInvocable();
    log.info(`discovered ${fns.length} invocable function(s): ${fns.map(f => f.name).join(', ') || '(none)'}`);

    await this.doNext(client);
  }

  async listen(): Promise<void> {
    if (this.stopped) return;
    let client: PoolClient;
    let release: () => void;
    try {
      client = await this.pgPool.connect();
      release = () => client.release();
    } catch (err) {
      log.error('Error connecting with notify listener', err);
      if (err instanceof Error && err.stack) {
        log.debug(err.stack);
      }
      if (!this.stopped) {
        setTimeout(() => this.listen(), 5000);
      }
      return;
    }
    if (this.stopped) {
      release();
      return;
    }
    this.listenClient = client;
    this.listenRelease = release;
    client.on('notification', () => {
      if (this.doNextTimer) {
        this.doNext(client);
      }
    });

    const schema = process.env.JOBS_SCHEMA || 'app_jobs';
    client.query(`LISTEN "${schema}:jobs:insert"`);
    client.on('error', (e: unknown) => {
      if (this.stopped) {
        release();
        return;
      }
      log.error('Error with database notify listener', e);
      if (e instanceof Error && e.stack) {
        log.debug(e.stack);
      }
      release();
      if (!this.stopped) {
        this.listen();
      }
    });
    log.info(`${this.workerId} connected and looking for jobs...`);
    this.doNext(client);
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.doNextTimer) {
      clearTimeout(this.doNextTimer);
      this.doNextTimer = undefined;
    }
    const client = this.listenClient;
    const release = this.listenRelease;
    this.listenClient = undefined;
    this.listenRelease = undefined;

    if (client && release) {
      client.removeAllListeners('notification');
      client.removeAllListeners('error');
      try {
        const schema = process.env.JOBS_SCHEMA || 'app_jobs';
        await client.query(`UNLISTEN "${schema}:jobs:insert"`);
      } catch {
        // Ignore listener cleanup errors during shutdown.
      }
      release();
    }
  }

  // ─── Main loop ───────────────────────────────────────────────────────

  async doNext(client: PgClientLike): Promise<void> {
    if (this.stopped) return;
    if (!this._initialized) {
      return await this.initialize(client);
    }

    log.debug('checking for jobs...');
    if (this.doNextTimer) {
      clearTimeout(this.doNextTimer);
      this.doNextTimer = undefined;
    }

    try {
      const job = (await jobs.getJob<ComputeJobRow>(client, {
        workerId: this.workerId,
        supportedTaskNames: null,
      })) as ComputeJobRow | undefined;

      if (!job || !job.id) {
        if (!this.stopped) {
          this.doNextTimer = setTimeout(
            () => this.doNext(client),
            this.idleDelay
          );
        }
        return;
      }

      const start = process.hrtime();
      let err: Error | null = null;
      try {
        await this.doWork(job);
      } catch (error) {
        err = error as Error;
      }
      const durationRaw = process.hrtime(start);
      const duration = ((durationRaw[0] * 1e9 + durationRaw[1]) / 1e6).toFixed(2);
      const jobId = job.id;

      try {
        if (err) {
          await this.handleError(client, { err, job, duration });
        } else {
          await this.handleSuccess(client, { job, duration });
        }
      } catch (fatalError: unknown) {
        await this.handleFatalError(client, { err, fatalError, jobId });
      }
      if (!this.stopped) {
        return this.doNext(client);
      }
      return;
    } catch (err: unknown) {
      if (!this.stopped) {
        this.doNextTimer = setTimeout(
          () => this.doNext(client),
          this.idleDelay
        );
      }
    }
  }

  // ─── GUC propagation ───────────────────────────────────────────────

  /**
   * Set PostgreSQL session variables (GUCs) from the job's context.
   * These are visible to triggers, RLS policies, and functions via current_setting().
   */
  private async setJobGUCs(job: ComputeJobRow): Promise<void> {
    const gucs: [string, string][] = [];
    const databaseId = job.database_id || this.platformDatabaseId;
    gucs.push(['jwt.claims.database_id', databaseId]);
    if (job.actor_id) gucs.push(['jwt.claims.user_id', job.actor_id]);
    if (job.entity_id) gucs.push(['jwt.claims.entity_id', job.entity_id]);
    if (job.organization_id) gucs.push(['jwt.claims.organization_id', job.organization_id]);

    const sets = gucs.map(([k, v]) => `set_config('${k}', '${v}', true)`).join(', ');
    if (sets) {
      await this.pgPool.query(`SELECT ${sets}`);
    }
  }

  // ─── Work dispatch ───────────────────────────────────────────────────

  async doWork(job: ComputeJobRow): Promise<void> {
    const { task_identifier, payload } = job;
    const graphNode = isGraphNodePayload(payload);

    log.debug('starting work on job', {
      id: job.id,
      task: task_identifier,
      databaseId: job.database_id,
      actorId: job.actor_id,
      entityId: job.entity_id,
      organizationId: job.organization_id,
      ...(graphNode ? { executionId: payload.execution_id, nodeName: payload.node_name } : {}),
    });

    // For graph nodes, task_identifier IS the function name (no prefix).
    // payload.node_type also carries it; we prefer it for graph dispatches
    // so the code stays explicit about the source.
    const functionName = graphNode ? payload.node_type : task_identifier;

    // Check for provisioning handler before function discovery
    const provisioningHandler = getProvisioningHandler(functionName);
    if (provisioningHandler) {
      await this.doWorkProvisioning(job, provisioningHandler, payload as Record<string, unknown>);
      return;
    }

    const fn = await this.discovery.resolve(functionName);
    if (!fn) {
      throw new Error(`Function "${functionName}" is not registered in platform_function_definitions`);
    }
    if (!fn.is_invocable) {
      throw new Error(`Function "${fn.name}" (${functionName}) is not invocable`);
    }

    // Validate graph node inputs against function's declared input ports
    if (graphNode) {
      this.validateGraphInputs(fn, payload.inputs, payload.node_name);
    }

    // Mark node as running in node_states (queued → running)
    if (graphNode) {
      await this.markNodeRunning(payload.execution_id, payload.node_name);
    }

    // Determine dispatch mode: inline (in-process) vs HTTP
    const isInline = fn.runtime === 'inline' || getInlineImpl(functionName) !== null;

    if (isInline) {
      await this.doWorkInline(job, fn, graphNode, payload);
    } else {
      await this.doWorkHttp(job, fn, graphNode, payload);
    }
  }

  // ─── Provisioning dispatch (in-process, K8s infrastructure) ──────────────

  private async doWorkProvisioning(
    job: ComputeJobRow,
    handler: (payload: Record<string, unknown>, context: import('@constructive-io/provisioning-handlers').ProvisioningContext) => Promise<Record<string, unknown>>,
    payload: Record<string, unknown>
  ): Promise<void> {
    const { task_identifier } = job;
    const databaseId = job.database_id || this.platformDatabaseId;
    const scope = job.entity_type || null;

    await this.setJobGUCs(job);

    const { id: invocationId } = await this.tracker.create({
      task_identifier,
      payload,
      job_id: job.id,
      database_id: databaseId,
      actor_id: job.actor_id,
      scope,
    });

    const reqStart = process.hrtime();
    try {
      const result = await handler(payload, {
        pool: this.pgPool,
        databaseId,
        loader: this.moduleLoader,
      });

      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.complete(
        invocationId, ms, undefined,
        scope, scope ? databaseId : undefined
      );

      await this.computeLog.log({
        task_identifier,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: databaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'completed',
        duration_ms: ms,
      });

      log.info(`provisioning ${task_identifier} completed in ${ms}ms`, result);
    } catch (err: any) {
      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.fail(
        invocationId, ms, err.message,
        scope, scope ? databaseId : undefined
      );

      await this.computeLog.log({
        task_identifier,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: databaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'failed',
        duration_ms: ms,
        error: err.message,
      });

      throw err;
    }
  }

  // ─── Inline dispatch (in-process, no HTTP) ──────────────────────────────

  private async doWorkInline(
    job: ComputeJobRow,
    fn: PlatformFunctionDefinition,
    graphNode: boolean,
    payload: any
  ): Promise<void> {
    const { task_identifier } = job;
    const functionName = fn.task_identifier;
    const databaseId = job.database_id || this.platformDatabaseId;
    const scope = job.entity_type || null;

    // Inline nodes use inputs directly; props come from the graph node definition
    const inputs = graphNode ? (payload.inputs as Record<string, unknown>) : (payload as Record<string, unknown>);

    // Convert props from array format [{name, type, value}, ...] to flat {name: value}
    const propsArray = (graphNode && Array.isArray(payload.props)) ? payload.props : [];
    const props: Record<string, unknown> = {};
    for (const p of propsArray) {
      if (p && typeof p === 'object' && 'name' in p) {
        props[p.name as string] = p.value;
      }
    }

    await this.setJobGUCs(job);

    const { id: invocationId } = await this.tracker.create({
      task_identifier,
      payload,
      job_id: job.id,
      database_id: databaseId,
      actor_id: job.actor_id,
      scope,
      graph_execution_id: graphNode ? payload.execution_id : undefined,
    });

    const reqStart = process.hrtime();
    try {
      const result = await executeInline(functionName, inputs, props);

      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.complete(
        invocationId, ms, undefined,
        scope, scope ? databaseId : undefined
      );

      await this.computeLog.log({
        task_identifier,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: databaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'completed',
        duration_ms: ms,
      });

      if (graphNode) {
        await this.completeGraphNode(
          payload.execution_id,
          payload.node_name,
          result
        );
      }
    } catch (err: any) {
      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.fail(
        invocationId, ms, err.message,
        scope, scope ? databaseId : undefined
      );

      await this.computeLog.log({
        task_identifier,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: databaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'failed',
        duration_ms: ms,
        error: err.message,
      });

      if (graphNode) {
        await this.failGraphExecution(payload.execution_id, payload.node_name, err.message);
        // Don't re-throw for graph nodes — execution is already marked failed.
        // Re-throwing would cause the job queue to retry with the same permanent error.
        return;
      }
      throw err;
    }
  }

  // ─── HTTP dispatch (external function service) ──────────────────────────

  private async doWorkHttp(
    job: ComputeJobRow,
    fn: PlatformFunctionDefinition,
    graphNode: boolean,
    payload: any
  ): Promise<void> {
    const { task_identifier } = job;
    const functionName = fn.task_identifier;

    const url = this.resolveUrl(fn.service_url, functionName);
    if (!url) {
      throw new Error(
        `No service URL for "${task_identifier}". Set service_url in platform_function_definitions or COMPUTE_GATEWAY_URL env var.`
      );
    }

    const databaseId = job.database_id || this.platformDatabaseId;
    const scope = job.entity_type || null;
    const billingEntityId = job.entity_id || job.organization_id;
    const meterSlug = functionName;

    // For graph nodes, send inputs as the HTTP body; for standalone, send the full payload
    const httpBody = graphNode ? payload.inputs : payload;

    // Set GUCs so triggers/RLS can see the job's user context
    await this.setJobGUCs(job);

    // Billing quota check (no-ops if billing not provisioned)
    if (billingEntityId) {
      const allowed = await this.billing.checkQuota(billingEntityId, meterSlug, 1, databaseId);
      if (!allowed) {
        throw new Error(`Billing quota exceeded for meter="${meterSlug}" entity=${billingEntityId}`);
      }
    }

    const { id: invocationId } = await this.tracker.create({
      task_identifier,
      payload,
      job_id: job.id,
      database_id: databaseId,
      actor_id: job.actor_id,
      scope,
      graph_execution_id: graphNode ? payload.execution_id : undefined,
    });

    const reqStart = process.hrtime();
    try {
      const result = await compute_request(url, {
        body: httpBody,
        database_id: databaseId,
        actor_id: job.actor_id,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        worker_id: this.workerId,
        job_id: job.id,
        invocation_id: invocationId,
        callback_url: this.callbackUrl,
        ...(graphNode ? {
          execution_id: payload.execution_id,
          node_name: payload.node_name,
        } : {}),
      });

      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.complete(
        invocationId, ms, undefined,
        scope, scope ? databaseId : undefined
      );

      // Record billing usage on success
      if (billingEntityId) {
        await this.billing.recordUsage(billingEntityId, meterSlug, 1, {
          task_identifier,
          duration_ms: ms,
          invocation_id: invocationId,
          job_id: String(job.id),
        }, databaseId);
      }

      // Write compute log entry (no-ops if compute_log_module not provisioned)
      await this.computeLog.log({
        task_identifier,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: databaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'completed',
        duration_ms: ms,
      });

      // Graph node completion: tell the SQL engine this node finished
      if (graphNode) {
        await this.completeGraphNode(
          payload.execution_id,
          payload.node_name,
          result.body
        );
      }
    } catch (err: any) {
      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.fail(
        invocationId, ms, err.message,
        scope, scope ? databaseId : undefined
      );

      // Write compute log entry for failures too
      await this.computeLog.log({
        task_identifier,
        job_id: job.id,
        invocation_id: invocationId,
        database_id: databaseId,
        entity_id: job.entity_id,
        organization_id: job.organization_id,
        entity_type: job.entity_type,
        actor_id: job.actor_id,
        status: 'failed',
        duration_ms: ms,
        error: err.message,
      });

      // Graph node failure: mark execution as failed
      if (graphNode) {
        await this.failGraphExecution(payload.execution_id, payload.node_name, err.message);
        // Don't re-throw for graph nodes — execution is already marked failed.
        // Re-throwing would cause the job queue to retry with the same permanent error.
        return;
      }
      throw err;
    }
  }

  // ─── Graph execution ──────────────────────────────────────────────────

  /**
   * Validate graph node inputs against the function's declared input ports.
   * Checks required ports are present and port types match expectations.
   * Throws with a descriptive error before dispatch rather than letting
   * the handler fail with a cryptic message.
   */
  private validateGraphInputs(
    fn: PlatformFunctionDefinition,
    inputs: Record<string, unknown>,
    nodeName: string
  ): void {
    const ports = fn.inputs;
    if (!ports || ports.length === 0) return;

    const errors: string[] = [];

    for (const port of ports) {
      const value = inputs[port.name];
      const missing = value === undefined || value === null;

      // Check required ports
      if (!port.optional && missing) {
        errors.push(`missing required input '${port.name}'`);
        continue;
      }

      if (missing) continue;

      // Type validation
      if (port.type) {
        const actual = typeof value;
        const expected = port.type;

        if (expected === 'string' && actual !== 'string') {
          errors.push(
            `input '${port.name}' expects string but got ${actual}`
          );
        } else if (expected === 'number' && actual !== 'number') {
          errors.push(
            `input '${port.name}' expects number but got ${actual}`
          );
        } else if (expected === 'boolean' && actual !== 'boolean') {
          errors.push(
            `input '${port.name}' expects boolean but got ${actual}`
          );
        }
        // 'json' and 'any' accept all types
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `${fn.name}[${nodeName}]: input validation failed — ${errors.join('; ')}`
      );
    }
  }

  /**
   * Resolve graph execution module config (cached via ComputeModuleLoader).
   */
  private async graphConfig(): Promise<GraphExecutionModuleConfig> {
    const config = await this.loader.load(this.platformDatabaseId);
    return config.graphExecutionModule;
  }

  /**
   * Transition a node from queued → running when the worker picks up the job.
   */
  private async markNodeRunning(
    executionId: string,
    nodeName: string
  ): Promise<void> {
    log.debug('marking graph node running', { executionId, nodeName });
    const ge = await this.graphConfig();
    await this.pgPool.query(
      `UPDATE "${ge.publicSchema}"."${ge.nodeStatesTable}"
       SET status = 'running', started_at = now()
       WHERE execution_id = $1::uuid AND node_name = $2 AND status = 'queued'`,
      [executionId, nodeName]
    );
  }

  /**
   * Complete a graph node after its function returns successfully.
   * Calls the SQL complete_node procedure which stores the output and
   * triggers tick_execution to cascade to downstream nodes.
   */
  private async completeGraphNode(
    executionId: string,
    nodeName: string,
    output: unknown
  ): Promise<void> {
    log.debug('completing graph node', { executionId, nodeName });
    const ge = await this.graphConfig();
    await this.pgPool.query(
      `SELECT "${ge.privateSchema}"."${ge.completeNodeFunction}"($1::uuid, $2, $3::jsonb)`,
      [executionId, nodeName, JSON.stringify(output ?? {})]
    );
  }

  /**
   * Mark a graph node and its execution as failed.
   * Calls the SQL fail_node procedure which updates node_states
   * (status=failed, error fields) and marks the execution as failed.
   */
  private async failGraphExecution(
    executionId: string,
    nodeName: string,
    errorMessage: string
  ): Promise<void> {
    log.error('graph node failed', { executionId, nodeName, error: errorMessage });
    try {
      const ge = await this.graphConfig();
      await this.pgPool.query(
        `SELECT "${ge.privateSchema}"."${ge.failNodeFunction}"($1::uuid, $2, $3, $4)`,
        [executionId, nodeName, 'NODE_EXECUTION_FAILED', errorMessage]
      );
    } catch (err: any) {
      log.warn('platform_fail_node raised; execution may already be finished', {
        executionId, nodeName, error: errorMessage, sqlError: err.message,
      });
    }
  }

  /**
   * Resolve the HTTP URL for a function.
   * Priority: service_url from DB → gateway development map → gateway_url pattern
   */
  private resolveUrl(
    serviceUrl: string | null,
    taskIdentifier: string
  ): string | null {
    if (serviceUrl) return serviceUrl;

    const devMap = jobs.getJobGatewayDevMap();
    if (devMap && devMap[taskIdentifier]) {
      return devMap[taskIdentifier];
    }

    if (this.gatewayUrl) {
      return `${this.gatewayUrl.replace(/\/$/, '')}/${taskIdentifier}`;
    }
    return null;
  }

  // ─── Result handlers ─────────────────────────────────────────────────

  async handleFatalError(
    _client: PgClientLike,
    { err, fatalError, jobId }: { err: Error | null; fatalError: unknown; jobId: ComputeJobRow['id'] }
  ): Promise<void> {
    const when = err ? `after failure '${err.message}'` : 'after success';
    log.error(`Failed to release job '${jobId}' ${when}; committing seppuku`);
    await poolManager.close();
    log.error(String(fatalError));
    process.exit(1);
  }

  async handleError(
    client: PgClientLike,
    { err, job, duration }: { err: Error; job: ComputeJobRow; duration: string }
  ): Promise<void> {
    log.error(
      `Failed task ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`
    );
    if (err.stack) {
      log.debug(err.stack);
    }
    await jobs.failJob(client, {
      workerId: this.workerId,
      jobId: job.id,
      message: err.message,
    });
  }

  async handleSuccess(
    client: PgClientLike,
    { job, duration }: { job: ComputeJobRow; duration: string }
  ): Promise<void> {
    log.debug(
      `Completed task ${job.id} (${job.task_identifier}) (${duration}ms)`
    );
    await jobs.completeJob(client, {
      workerId: this.workerId,
      jobId: job.id,
    });
  }
}
