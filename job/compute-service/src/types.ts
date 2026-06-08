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

export type ComputeServiceOptions = {
  functions?: FunctionsOptions;
  jobs?: JobsOptions;
};

export type StartedFunction = {
  name: FunctionName;
  port: number;
};

export type ComputeServiceResult = {
  functions: StartedFunction[];
  jobs: boolean;
};
