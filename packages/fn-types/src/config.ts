export type FnPreset = 'functions-only' | 'jobs-bundle';

export type K8sTarget = 'knative' | 'deployment';

export interface K8sResourceQuantities {
  cpu?: string;
  memory?: string;
}

export interface K8sOptions {
  target?: K8sTarget;
  namespace?: string;
  imagePullSecrets?: string[];
  resources?: {
    requests?: K8sResourceQuantities;
    limits?: K8sResourceQuantities;
  };
  /** Knative-specific: containerConcurrency, timeoutSeconds, etc. */
  knative?: {
    containerConcurrency?: number;
    timeoutSeconds?: number;
    visibility?: 'cluster-local' | 'public';
  };
}

export interface DockerOptions {
  /** Image registry, e.g. 'ghcr.io/my-org'. */
  registry?: string;
  /** Base image override; defaults to template's choice. */
  baseImage?: string;
  /** Generate one Dockerfile per function (true) vs one shared image (false). */
  perFunction?: boolean;
}

export interface FnConfig {
  /** Directory containing per-function source: <dir>/<name>/handler.{json,ts,py}. Default: 'functions'. */
  functionsDir?: string;
  /** Output directory for generated artifacts. Default: 'generated'. */
  outputDir?: string;
  /** Bundle preset. Default: 'functions-only'. */
  preset?: FnPreset;
  /** Image registry default; per-function manifests can still override. */
  registry?: string;
  /** Default Kubernetes namespace for generated manifests. */
  namespace?: string;
  k8s?: K8sOptions;
  docker?: DockerOptions;
  /** Map of template type → module specifier resolved by the generator. */
  templates?: Record<string, string>;
}

/** Identity helper for editor autocomplete in fn.config.ts files. */
export const defineConfig = (config: FnConfig): FnConfig => config;
