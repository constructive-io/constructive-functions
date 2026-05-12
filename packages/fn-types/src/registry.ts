export interface FnRegistryEntry {
  /** Function name from handler.json (e.g., 'send-email', 'knative-job-example'). */
  name: string;
  /** Directory under functions/ containing the source. May differ from `name`. */
  dir: string;
  /** HTTP port the function listens on. */
  port: number;
  /** Template type (e.g., 'node-graphql', 'python'). */
  type: string;
  /** Task identifier used by the job worker (defaults to `name` when omitted). */
  taskIdentifier?: string;
  /** npm-style module ID for dynamic require (in-process dispatch, optional). */
  moduleName?: string;
  /** HTTP URL for remote dispatch (cluster job-service, optional). */
  url?: string;
}

export interface FnRegistry {
  functions: FnRegistryEntry[];
}
