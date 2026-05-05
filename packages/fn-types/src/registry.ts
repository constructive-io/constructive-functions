export interface FnRegistryEntry {
  name: string;
  /** npm-style module ID for dynamic require (in-process job-service). */
  moduleName?: string;
  /** HTTP URL for remote dispatch (cluster job-service). */
  url?: string;
  /** Default port the function listens on. */
  port?: number;
}

export interface FnRegistry {
  version: 1;
  functions: FnRegistryEntry[];
}
