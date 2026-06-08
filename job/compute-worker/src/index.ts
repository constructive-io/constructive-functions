/**
 * ComputeWorker — Platform-aware job worker.
 *
 * Unlike the original knative-job-worker which looks up functions from a
 * static manifest, ComputeWorker queries constructive_infra_public
 * .platform_function_definitions to discover registered functions and
 * tracks every invocation in platform_function_invocations.
 *
 * Flow:
 *   1. Poll app_jobs.jobs for the next job
 *   2. Lazy-resolve the function definition from DB (cached)
 *   3. Create an invocation record (status=running)
 *   4. HTTP POST to the function's service_url
 *   5. Update invocation to completed/failed with duration
 */

import poolManager from '@constructive-io/job-pg';
import type { PgClientLike } from '@constructive-io/job-utils';
import * as jobs from '@constructive-io/job-utils';
import { Logger } from '@pgpmjs/logger';
import type { Pool, PoolClient } from 'pg';

import { FunctionDiscovery } from './discovery';
import { InvocationTracker } from './invocation';
import { compute_request } from './req';
import type { ComputeJobRow, ComputeWorkerOptions } from './types';

export { TtlCache } from './cache';
export { FunctionDiscovery } from './discovery';
export { InvocationTracker } from './invocation';
export type { ComputeRequestOptions } from './req';
export { compute_request } from './req';
export type {
  ComputeJobRow,
  ComputeWorkerOptions,
  CreateInvocationInput,
  FunctionRequirement,
  InvocationStatus,
  PlatformFunctionDefinition,
} from './types';

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

  readonly discovery: FunctionDiscovery;
  readonly tracker: InvocationTracker;

  private callbackUrl?: string;
  private gatewayUrl?: string;

  constructor(opts: ComputeWorkerOptions) {
    this.idleDelay = opts.idleDelay ?? 15_000;
    this.workerId = opts.workerId ?? 'compute-worker-0';
    this.pgPool = opts.pgPool;
    this.discovery = new FunctionDiscovery(this.pgPool, opts.cacheTtlMs);
    this.tracker = new InvocationTracker(this.pgPool);

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

  // ─── Work dispatch ───────────────────────────────────────────────────

  async doWork(job: ComputeJobRow): Promise<void> {
    const { task_identifier, payload } = job;
    log.debug('starting work on job', {
      id: job.id,
      task: task_identifier,
      databaseId: job.database_id,
    });

    const fn = await this.discovery.resolve(task_identifier);
    if (!fn) {
      throw new Error(`Function "${task_identifier}" is not registered in platform_function_definitions`);
    }
    if (!fn.is_invocable) {
      throw new Error(`Function "${fn.name}" (${task_identifier}) is not invocable`);
    }

    const url = this.resolveUrl(fn.service_url, task_identifier);
    if (!url) {
      throw new Error(
        `No service URL for "${task_identifier}". Set service_url in platform_function_definitions or COMPUTE_GATEWAY_URL env var.`
      );
    }

    const { id: invocationId } = await this.tracker.create({
      function_id: fn.id,
      task_identifier,
      payload,
      job_id: job.id,
      database_id: job.database_id,
      actor_id: job.actor_id,
    });

    const reqStart = process.hrtime();
    try {
      await compute_request(url, {
        body: payload,
        database_id: job.database_id,
        actor_id: job.actor_id,
        entity_id: job.entity_id,
        worker_id: this.workerId,
        job_id: job.id,
        invocation_id: invocationId,
        callback_url: this.callbackUrl,
      });

      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.complete(invocationId, ms);
    } catch (err: any) {
      const elapsed = process.hrtime(reqStart);
      const ms = Math.round((elapsed[0] * 1e9 + elapsed[1]) / 1e6);
      await this.tracker.fail(invocationId, ms, err.message);
      throw err;
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
    _client: PgClientLike,
    { job, duration }: { job: ComputeJobRow; duration: string }
  ): Promise<void> {
    log.info(
      `Completed task ${job.id} (${job.task_identifier}) in ${duration}ms`
    );
  }
}

export { ComputeWorker };
