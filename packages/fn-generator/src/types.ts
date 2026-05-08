import type { HandlerManifest } from '@constructive-io/fn-types';

/**
 * A single output unit from the generator. `path` is absolute; the apply step
 * decides whether to write a file (idempotently) or create/refresh a symlink.
 */
export type Manifest =
  | { kind: 'file'; path: string; content: string }
  | { kind: 'symlink'; path: string; target: string };

export interface FunctionInfo {
  /** Function name from handler.json (e.g., 'knative-job-example'). */
  name: string;
  /** Directory under functions/ (e.g., 'example'). May differ from `name`. */
  dir: string;
  /** Resolved port (auto-assigned if missing on input). */
  port: number;
  /** Template type. Defaults to `defaultTemplate` from options when missing. */
  type: string;
  /** Original handler.json contents. */
  manifest: HandlerManifest;
}

export interface FnGeneratorOptions {
  /** Repo root. Default: process.cwd(). Used for skaffold.yaml output path. */
  rootDir?: string;
  /** Where source functions live. Default: `<rootDir>/functions`. */
  functionsDir?: string;
  /** Where generated artifacts go. Default: `<rootDir>/generated`. */
  outputDir?: string;
  /** Where templates live. Default: `<rootDir>/templates`. */
  templatesDir?: string;
  /** Kubernetes namespace stamped into configmaps and skaffold. Default: 'constructive-functions'. */
  namespace?: string;
  /** Default template type when handler.json omits `type`. Default: 'node-graphql'. */
  defaultTemplate?: string;
}

export interface GenerateOptions {
  /** Generate only this function (matched by directory name). */
  only?: string;
  /**
   * Skip everything after the per-function package generation: no
   * functions-manifest.json, no configmaps, no skaffold.yaml.
   * Used by Dockerfile.dev to build a small early cache layer.
   */
  packagesOnly?: boolean;
}

export interface ApplyResult {
  filesWritten: string[];
  symlinksCreated: string[];
}
