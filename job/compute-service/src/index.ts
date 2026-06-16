/**
 * ComputeService — platform-aware job service orchestrator.
 *
 * Mirrors the KnativeJobsSvc pattern from job/service but swaps the
 * static Worker for the platform-aware ComputeWorker which discovers
 * functions and tracks invocations via dynamic metaschema resolution.
 *
 * It starts:
 *   1. (optional) In-process function servers from the manifest
 *   2. An HTTP callback server for job completion
 *   3. A ComputeWorker that polls jobs and dispatches to functions
 *   4. A Scheduler for cron-like scheduled jobs
 */

import ComputeWorker, { ModuleLoader } from '@constructive-io/compute-worker';
import poolManager from '@constructive-io/job-pg';
import Scheduler from '@constructive-io/job-scheduler';
import {
  getJobPgConfig,
  getJobsCallbackPort,
  getJobSchema,
  getSchedulerHostname,
  getWorkerHostname,
} from '@constructive-io/job-utils';
import jobServerFactory from '@constructive-io/knative-job-server';
import { parseEnvBoolean } from '@pgpmjs/env';
import { Logger } from '@pgpmjs/logger';
import retry from 'async-retry';
import type { Server as HttpServer } from 'http';
import { createRequire } from 'module';
import { Client, Pool } from 'pg';

import {
  loadFunctionRegistry,
} from './registry';
import type {
  ComputeServiceOptions,
  ComputeServiceResult,
  FunctionName,
  FunctionServiceConfig,
  FunctionsOptions,
  StartedFunction,
} from './types';

const functionRegistry = loadFunctionRegistry();

const log = new Logger('compute-service');
const requireFn = createRequire(__filename);

// ─── Function loading (same pattern as job/service) ──────────────────────────

interface FunctionRegistryEntry {
  moduleName: string;
  defaultPort: number;
}

const resolveFunctionEntry = (name: FunctionName): FunctionRegistryEntry => {
  const entry = functionRegistry[name];
  if (!entry) {
    throw new Error(`Unknown function "${name}".`);
  }
  return entry;
};

const loadFunctionApp = (moduleName: string) => {
  const knativeModuleId = requireFn.resolve('@constructive-io/knative-job-fn');
  delete requireFn.cache[knativeModuleId];

  const moduleId = requireFn.resolve(moduleName);
  delete requireFn.cache[moduleId];

  const mod = requireFn(moduleName) as { default?: { listen: (port: number, cb?: () => void) => unknown } };
  const app = mod.default ?? mod;

  if (!app || typeof (app as { listen?: unknown }).listen !== 'function') {
    throw new Error(`Function module "${moduleName}" does not export a listenable app.`);
  }

  return app as { listen: (port: number, cb?: () => void) => unknown };
};

const shouldEnableFunctions = (options?: FunctionsOptions): boolean => {
  if (!options) return false;
  if (typeof options.enabled === 'boolean') return options.enabled;
  return Boolean(options.services?.length);
};

const normalizeFunctionServices = (
  options?: FunctionsOptions
): FunctionServiceConfig[] => {
  if (!shouldEnableFunctions(options)) return [];

  if (!options?.services?.length) {
    return Object.keys(functionRegistry).map((name) => ({
      name: name as FunctionName
    }));
  }

  return options.services;
};

const resolveFunctionPort = (service: FunctionServiceConfig): number => {
  const entry = resolveFunctionEntry(service.name);
  return service.port ?? entry.defaultPort;
};

const ensureUniquePorts = (services: FunctionServiceConfig[]) => {
  const usedPorts = new Set<number>();
  for (const service of services) {
    const port = resolveFunctionPort(service);
    if (usedPorts.has(port)) {
      throw new Error(`Function port ${port} is assigned more than once.`);
    }
    usedPorts.add(port);
  }
};

const startFunction = async (
  service: FunctionServiceConfig,
  functionServers: Map<FunctionName, HttpServer>
): Promise<StartedFunction> => {
  const entry = resolveFunctionEntry(service.name);
  const port = resolveFunctionPort(service);
  const app = loadFunctionApp(entry.moduleName);

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      log.info(`function:${service.name} listening on ${port}`);
      resolve();
    }) as HttpServer & { on?: (event: string, cb: (err: Error) => void) => void };

    if (server?.on) {
      server.on('error', (err) => {
        log.error(`function:${service.name} failed to start`, err);
        reject(err);
      });
    }

    functionServers.set(service.name, server);
  });

  return { name: service.name, port };
};

const startFunctions = async (
  options: FunctionsOptions | undefined,
  functionServers: Map<FunctionName, HttpServer>
): Promise<StartedFunction[]> => {
  const services = normalizeFunctionServices(options);
  if (!services.length) return [];

  ensureUniquePorts(services);

  const started: StartedFunction[] = [];
  for (const service of services) {
    started.push(await startFunction(service, functionServers));
  }

  return started;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

type JobRunner = {
  listen: () => void;
  stop?: () => Promise<void> | void;
};

const listenApp = async (
  app: { listen: (port: number, host?: string) => HttpServer },
  port: number,
  host?: string
): Promise<HttpServer> =>
  new Promise((resolveListen, rejectListen) => {
    const server = host ? app.listen(port, host) : app.listen(port);

    const cleanup = () => {
      server.off('listening', handleListen);
      server.off('error', handleError);
    };

    const handleListen = () => {
      cleanup();
      resolveListen(server);
    };

    const handleError = (err: Error) => {
      cleanup();
      rejectListen(err);
    };

    server.once('listening', handleListen);
    server.once('error', handleError);
  });

const closeServer = async (server?: HttpServer | null): Promise<void> => {
  if (!server || !server.listening) return;
  await new Promise<void>((resolveClose, rejectClose) => {
    server.close((err) => {
      if (err) {
        rejectClose(err);
        return;
      }
      resolveClose();
    });
  });
};

// ─── ComputeService ──────────────────────────────────────────────────────────

export class ComputeService {
  private options: ComputeServiceOptions;
  private started = false;
  private result: ComputeServiceResult = {
    functions: [],
    jobs: false
  };
  private functionServers = new Map<FunctionName, HttpServer>();
  private jobsHttpServer?: HttpServer;
  private worker?: JobRunner;
  private scheduler?: JobRunner;
  private jobsPoolManager?: { close: () => Promise<void> };

  constructor(options: ComputeServiceOptions = {}) {
    this.options = options;
  }

  async start(): Promise<ComputeServiceResult> {
    if (this.started) return this.result;
    this.started = true;
    this.result = {
      functions: [],
      jobs: false
    };

    if (shouldEnableFunctions(this.options.functions)) {
      log.info('starting functions');
      this.result.functions = await startFunctions(
        this.options.functions,
        this.functionServers
      );
    }

    if (this.options.jobs?.enabled !== false) {
      log.info('starting compute jobs service');
      await this.startJobs();
      this.result.jobs = true;
    }

    return this.result;
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    this.started = false;

    if (this.worker?.stop) {
      await this.worker.stop();
    }
    if (this.scheduler?.stop) {
      await this.scheduler.stop();
    }
    this.worker = undefined;
    this.scheduler = undefined;

    await closeServer(this.jobsHttpServer);
    this.jobsHttpServer = undefined;

    if (this.jobsPoolManager) {
      await this.jobsPoolManager.close();
      this.jobsPoolManager = undefined;
    }

    for (const server of this.functionServers.values()) {
      await closeServer(server);
    }
    this.functionServers.clear();
  }

  private async startJobs(): Promise<void> {
    const pgPool = poolManager.getPool();
    const jobsApp = jobServerFactory(pgPool);
    const callbackPort = getJobsCallbackPort();
    this.jobsHttpServer = await listenApp(jobsApp, callbackPort);

    const databaseId = process.env.DEFAULT_DATABASE_ID || undefined;

    // Platform-aware worker: discovers functions from the database
    this.worker = new ComputeWorker({
      pgPool,
      workerId: getWorkerHostname(),
      databaseId,
    });

    this.scheduler = new Scheduler({
      pgPool,
      tasks: [], // ComputeWorker accepts any task from the DB
      workerId: getSchedulerHostname(),
    });

    this.jobsPoolManager = poolManager;

    this.worker.listen();
    this.scheduler.listen();
  }
}

// ─── Env-based configuration ─────────────────────────────────────────────────

const parseList = (value?: string): string[] => {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const parsePortMap = (value?: string): Record<string, number> => {
  if (!value) return {};
  const trimmed = value.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, number>;
      return Object.entries(parsed).reduce<Record<string, number>>((acc, [key, port]) => {
        const portNumber = Number(port);
        if (Number.isFinite(portNumber)) {
          acc[key] = portNumber;
        }
        return acc;
      }, {});
    } catch {
      return {};
    }
  }
  return trimmed.split(',').reduce<Record<string, number>>((acc, pair) => {
    const [rawName, rawPort] = pair.split(/[:=]/).map((item) => item.trim());
    const port = Number(rawPort);
    if (rawName && Number.isFinite(port)) {
      acc[rawName] = port;
    }
    return acc;
  }, {});
};

const buildFunctionsOptionsFromEnv = (): ComputeServiceOptions['functions'] => {
  const rawFunctions = (process.env.CONSTRUCTIVE_FUNCTIONS || '').trim();
  if (!rawFunctions) return undefined;

  const portMap = parsePortMap(process.env.CONSTRUCTIVE_FUNCTION_PORTS);
  const normalized = rawFunctions.toLowerCase();

  if (normalized === 'all' || normalized === '*') {
    return { enabled: true };
  }

  const names = parseList(rawFunctions) as FunctionName[];
  if (!names.length) return undefined;

  const services: FunctionServiceConfig[] = names.map((name) => ({
    name,
    port: portMap[name]
  }));

  return { enabled: true, services };
};

export const buildComputeServiceOptionsFromEnv = (): ComputeServiceOptions => ({
  jobs: {
    enabled: parseEnvBoolean(process.env.COMPUTE_JOBS_ENABLED) ?? true
  },
  functions: buildFunctionsOptionsFromEnv()
});

// ─── Prereqs ─────────────────────────────────────────────────────────────────

export const waitForComputePrereqs = async (): Promise<void> => {
  log.info('waiting for compute prereqs');
  let client: Client | null = null;
  let pool: Pool | null = null;
  try {
    const cfg = getJobPgConfig();
    client = new Client({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database
    });
    await client.connect();

    const schema = getJobSchema();
    await client.query(`SELECT * FROM "${schema}".jobs LIMIT 1;`);

    // Try dynamic resolution from metaschema first, fall back to direct check
    const databaseId = process.env.DEFAULT_DATABASE_ID || '00000000-0000-0000-0000-000000000000';
    pool = new Pool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      max: 1,
    });
    const loader = new ModuleLoader({ pool, ttlMs: 0 });
    const fnConfig = await loader.function.load(databaseId, null);
    await client.query(`SELECT count(*) FROM "${fnConfig.publicSchema}"."${fnConfig.definitionsTable}" LIMIT 1`);

    log.info('compute prereqs satisfied (jobs table + compute module present)');
  } catch (error) {
    log.error(error);
    throw new Error('compute-service boot failed — jobs table or compute module not ready');
  } finally {
    if (client) {
      void client.end();
    }
    if (pool) {
      void pool.end();
    }
  }
};

// ─── Boot ────────────────────────────────────────────────────────────────────

export const bootCompute = async (): Promise<void> => {
  log.info('attempting to boot compute-service');
  await retry(
    async () => {
      await waitForComputePrereqs();
    },
    {
      retries: 10,
      factor: 2
    }
  );

  const options = buildComputeServiceOptionsFromEnv();

  const pgConfig = getJobPgConfig();
  log.info('[compute-service] Starting with config:', {
    database: pgConfig.database,
    host: pgConfig.host,
    port: pgConfig.port,
    schema: getJobSchema(),
    callbackPort: getJobsCallbackPort(),
    workerHostname: getWorkerHostname(),
    schedulerHostname: getSchedulerHostname(),
    jobsEnabled: options.jobs?.enabled ?? true,
    functionsEnabled: shouldEnableFunctions(options.functions),
    functions: normalizeFunctionServices(options.functions).map(s => s.name)
  });

  if (options.jobs?.enabled === false) {
    log.info('compute jobs disabled; skipping startup');
    return;
  }

  const server = new ComputeService(options);
  await server.start();
};

export * from './types';
