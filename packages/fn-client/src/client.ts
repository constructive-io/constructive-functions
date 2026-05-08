import * as fs from 'fs';
import * as path from 'path';
import type { FnConfig, FnRegistry } from '@constructive-io/fn-types';
import {
  FnGenerator,
  type ApplyResult,
  type FunctionInfo,
  type GenerateOptions,
} from '@constructive-io/fn-generator';
import { loadConfig } from './config';
import { spawnProcesses } from './dev';
import { runBuild } from './build';
import type {
  BuildOptions,
  DevHandle,
  DevOptions,
  DevProcessDef,
  FnClientOptions,
} from './types';

interface ResolvedClientOptions {
  rootDir: string;
  config: FnConfig;
}

const resolve = (opts: FnClientOptions): ResolvedClientOptions => {
  const rootDir = opts.rootDir ?? process.cwd();
  let config: FnConfig | null = null;
  if (opts.config && typeof opts.config === 'object') {
    config = opts.config;
  } else if (typeof opts.config === 'string' || opts.config === undefined) {
    config = loadConfig(typeof opts.config === 'string' ? opts.config : undefined, rootDir);
  }
  return { rootDir, config: config ?? {} };
};

/**
 * Programmatic client for the Constructive Functions toolkit. Wraps
 * `FnGenerator` with config loading, manifest readers, and child-process
 * orchestration for local dev.
 */
export class FnClient {
  readonly rootDir: string;
  readonly config: FnConfig;
  private readonly generator: FnGenerator;

  constructor(options: FnClientOptions = {}) {
    const { rootDir, config } = resolve(options);
    this.rootDir = rootDir;
    this.config = config;
    this.generator = new FnGenerator({
      rootDir,
      functionsDir: config.functionsDir
        ? path.resolve(rootDir, config.functionsDir)
        : undefined,
      outputDir: config.outputDir ? path.resolve(rootDir, config.outputDir) : undefined,
      namespace: config.k8s?.namespace ?? config.namespace,
    });
  }

  /** Discover functions and resolve their info. */
  discover(only?: string): FunctionInfo[] {
    return this.generator.discover(only);
  }

  /** Generate all artifacts (delegates to FnGenerator). */
  generate(opts: GenerateOptions = {}): ApplyResult & { functions: FunctionInfo[] } {
    return this.generator.generate(opts);
  }

  /** Read the on-disk functions-manifest.json (returns null if missing). */
  loadManifest(): FnRegistry | null {
    const outputDir = this.config.outputDir
      ? path.resolve(this.rootDir, this.config.outputDir)
      : path.resolve(this.rootDir, 'generated');
    const manifestPath = path.join(outputDir, 'functions-manifest.json');
    if (!fs.existsSync(manifestPath)) return null;
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as FnRegistry;
  }

  /** Build process defs from the on-disk manifest (one per function). */
  defaultProcessDefs(): DevProcessDef[] {
    const manifest = this.loadManifest();
    if (!manifest) return [];
    const outputDir = this.config.outputDir
      ? path.resolve(this.rootDir, this.config.outputDir)
      : path.resolve(this.rootDir, 'generated');
    return manifest.functions.map((fn) => ({
      name: fn.name,
      script: path.join(outputDir, fn.dir, 'dist', 'index.js'),
      port: fn.port,
    }));
  }

  /**
   * Run pnpm build (optionally filtered). Resolves when the build finishes.
   * Uses the host's `pnpm` binary.
   */
  async build(opts: BuildOptions = {}): Promise<void> {
    return runBuild(this.rootDir, opts);
  }

  /**
   * Start the function processes (and optionally a job-service) as Node
   * children. Returns a handle whose `stop()` SIGTERMs them all and resolves
   * when they exit.
   */
  dev(opts: DevOptions = {}): DevHandle {
    let defs = opts.processes ?? this.defaultProcessDefs();
    if (opts.only) defs = defs.filter((d) => d.name === opts.only);
    const all = opts.jobService ? [opts.jobService, ...defs] : defs;
    if (all.length === 0) {
      throw new Error(
        'No processes to start. Run `fn generate && fn build` first, or pass `processes` explicitly.'
      );
    }
    return spawnProcesses(all, opts);
  }
}
