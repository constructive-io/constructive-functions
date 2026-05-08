import * as fs from 'fs';
import * as path from 'path';
import { computeFunctionInfos, findFunctions, resolveTemplateDir } from './discovery';
import { ensureSymlink, writeIfChanged } from './fs-utils';
import { buildPackageManifests } from './builders/package';
import { buildManifestJson } from './builders/manifest';
import { buildConfigMap } from './builders/configmap';
import { buildSkaffold } from './builders/skaffold';
import type {
  ApplyResult,
  FnGeneratorOptions,
  FunctionInfo,
  GenerateOptions,
  Manifest,
} from './types';

const DEFAULT_NAMESPACE = 'constructive-functions';
const DEFAULT_TEMPLATE = 'node-graphql';

interface ResolvedOptions {
  rootDir: string;
  functionsDir: string;
  outputDir: string;
  templatesDir: string;
  sharedDir: string;
  namespace: string;
  defaultTemplate: string;
}

const resolveOptions = (opts: FnGeneratorOptions = {}): ResolvedOptions => {
  const rootDir = opts.rootDir ?? process.cwd();
  const templatesDir = opts.templatesDir ?? path.resolve(rootDir, 'templates');
  return {
    rootDir,
    functionsDir: opts.functionsDir ?? path.resolve(rootDir, 'functions'),
    outputDir: opts.outputDir ?? path.resolve(rootDir, 'generated'),
    templatesDir,
    sharedDir: path.resolve(templatesDir, 'shared'),
    namespace: opts.namespace ?? DEFAULT_NAMESPACE,
    defaultTemplate: opts.defaultTemplate ?? DEFAULT_TEMPLATE,
  };
};

export class FnGenerator {
  private readonly opts: ResolvedOptions;

  constructor(options: FnGeneratorOptions = {}) {
    this.opts = resolveOptions(options);
  }

  /** Discover functions and resolve their info (port assignment, type defaulting). */
  discover(only?: string): FunctionInfo[] {
    const dirs = findFunctions(this.opts.functionsDir, only);
    if (dirs.length === 0) return [];
    return computeFunctionInfos(dirs, this.opts.functionsDir, this.opts.defaultTemplate);
  }

  /** Build all per-function package manifests (templates + shared + symlinks). */
  buildPackages(fns: FunctionInfo[]): Manifest[] {
    const out: Manifest[] = [];
    for (const fn of fns) {
      const fnDir = path.join(this.opts.functionsDir, fn.dir);
      const genDir = path.join(this.opts.outputDir, fn.dir);
      const templateDir = resolveTemplateDir(
        fn.manifest,
        this.opts.templatesDir,
        this.opts.defaultTemplate
      );
      out.push(
        ...buildPackageManifests(fn, {
          fnDir,
          genDir,
          templateDir,
          sharedDir: this.opts.sharedDir,
        })
      );
    }
    return out;
  }

  /** Build the global functions-manifest.json. */
  buildManifest(fns: FunctionInfo[]): Manifest {
    return buildManifestJson(fns, this.opts.outputDir);
  }

  /** Build per-function and aggregate functions-configmap.yaml entries. */
  buildConfigMaps(fns: FunctionInfo[]): Manifest[] {
    const out: Manifest[] = [];
    for (const fn of fns) {
      out.push(
        buildConfigMap({
          fns,
          target: fn,
          outputDir: this.opts.outputDir,
          templatesDir: this.opts.templatesDir,
          namespace: this.opts.namespace,
        })
      );
    }
    out.push(
      buildConfigMap({
        fns,
        outputDir: this.opts.outputDir,
        templatesDir: this.opts.templatesDir,
        namespace: this.opts.namespace,
      })
    );
    return out;
  }

  /** Build the root skaffold.yaml. */
  buildSkaffold(fns: FunctionInfo[]): Manifest {
    return buildSkaffold({
      fns,
      rootDir: this.opts.rootDir,
      templatesDir: this.opts.templatesDir,
      namespace: this.opts.namespace,
    });
  }

  /** Write all manifests to disk idempotently. */
  apply(manifests: Manifest[]): ApplyResult {
    const filesWritten: string[] = [];
    const symlinksCreated: string[] = [];
    for (const m of manifests) {
      if (m.kind === 'file') {
        if (writeIfChanged(m.path, m.content)) filesWritten.push(m.path);
      } else {
        if (ensureSymlink(m.target, m.path)) symlinksCreated.push(m.path);
      }
    }
    return { filesWritten, symlinksCreated };
  }

  /**
   * One-shot: discover, build all manifests, and apply. Returns the
   * apply result plus the discovered function infos for inspection.
   */
  generate(opts: GenerateOptions = {}): ApplyResult & { functions: FunctionInfo[] } {
    const fns = this.discover(opts.only);
    if (fns.length === 0) {
      return { filesWritten: [], symlinksCreated: [], functions: [] };
    }

    if (!fs.existsSync(this.opts.outputDir)) {
      fs.mkdirSync(this.opts.outputDir, { recursive: true });
    }

    const manifests: Manifest[] = [...this.buildPackages(fns)];

    if (!opts.packagesOnly) {
      manifests.push(this.buildManifest(fns));
      // Per-function and aggregate configmaps + skaffold are skipped in --only mode
      // (matches legacy generator: those files reflect the whole repo).
      if (!opts.only) {
        manifests.push(...this.buildConfigMaps(fns));
        manifests.push(this.buildSkaffold(fns));
      }
    }

    const result = this.apply(manifests);
    return { ...result, functions: fns };
  }
}
