import { PgpmPackage } from '@pgpmjs/core';
import { getEnvOptions } from '@pgpmjs/env';
import { createLogger } from '@pgpmjs/logger';
import type { PgpmFunctionContext, PgpmServerOptions } from './types';

type RequestHeaders = {
  databaseId?: string;
  workerId?: string;
  jobId?: string;
};

export const buildPgpmContext = (
  headers: RequestHeaders,
  options: PgpmServerOptions = {}
): PgpmFunctionContext => {
  const env = process.env as Record<string, string | undefined>;
  const log = createLogger(options.name || 'fn-pgpm');

  const cwd = options.cwd || env.PGPM_CWD || process.cwd();
  const project = new PgpmPackage(cwd);
  const pgpmOptions = getEnvOptions();

  return {
    job: {
      jobId: headers.jobId,
      workerId: headers.workerId,
      databaseId: headers.databaseId
    },
    project,
    options: pgpmOptions,
    log,
    env
  };
};
