export type JobMeta = {
  jobId?: string;
  workerId?: string;
  databaseId?: string;
};

export type LogFn = {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export type Env = Record<string, string | undefined>;

export type BaseContext = {
  job: JobMeta;
  log: LogFn;
  env: Env;
};

export type BaseServerOptions = {
  name?: string;
};

export type RequestHeaders = {
  databaseId?: string;
  workerId?: string;
  jobId?: string;
};

export type BaseFunctionHandler<
  P = unknown,
  C extends BaseContext = BaseContext,
  R = unknown
> = (params: P, context: C) => Promise<R> | R;

export const DEFAULT_DATABASE_NAME = 'constructive';
