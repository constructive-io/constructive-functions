/**
 * Function names are dynamic — looked up at runtime from the registry loaded
 * from generated/functions-manifest.json (or the FUNCTIONS_MANIFEST_PATH /
 * FUNCTIONS_REGISTRY env vars). Kept as an alias for narrowing intent.
 */
export type FunctionName = string;

export type FunctionServiceConfig = {
  name: FunctionName;
  port?: number;
};

export type FunctionsOptions = {
  enabled?: boolean;
  services?: FunctionServiceConfig[];
};

export type JobsOptions = {
  enabled?: boolean;
};

export type KnativeJobsSvcOptions = {
  functions?: FunctionsOptions;
  jobs?: JobsOptions;
};

export type StartedFunction = {
  name: FunctionName;
  port: number;
};

export type KnativeJobsSvcResult = {
  functions: StartedFunction[];
  jobs: boolean;
};
