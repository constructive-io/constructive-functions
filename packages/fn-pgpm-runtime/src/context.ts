import type { Env, LogFn, RequestHeaders } from '@constructive-io/fn-core';
import type { PgpmPackage } from '@pgpmjs/core';
import type { PgpmOptions } from '@pgpmjs/types';
import type { PgpmFunctionContext } from './types';

export type PgpmServerResources = {
  project: PgpmPackage;
  options: PgpmOptions;
  log: LogFn;
  env: Env;
};

export const buildPgpmContext = (
  headers: RequestHeaders,
  resources: PgpmServerResources
): PgpmFunctionContext => ({
  job: {
    jobId: headers.jobId,
    workerId: headers.workerId,
    databaseId: headers.databaseId
  },
  project: resources.project,
  options: resources.options,
  log: resources.log,
  env: resources.env
});
