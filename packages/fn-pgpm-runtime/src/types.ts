import type { PgpmPackage } from '@pgpmjs/core';
import type { PgpmOptions } from '@pgpmjs/types';

export type PgpmFunctionHandler<P = unknown, R = unknown> = (
  params: P,
  context: PgpmFunctionContext
) => Promise<R> | R;

export type PgpmFunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
  };
  project: PgpmPackage;
  options: PgpmOptions;
  log: { info: (...args: any[]) => void; error: (...args: any[]) => void; warn: (...args: any[]) => void };
  env: Record<string, string | undefined>;
};

export type PgpmServerOptions = {
  name?: string;
  cwd?: string;
};
