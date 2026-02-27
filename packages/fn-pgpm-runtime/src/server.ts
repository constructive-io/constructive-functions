import { createServer } from '@constructive-io/fn-core';
import type { Env, RequestHeaders } from '@constructive-io/fn-core';
import { PgpmPackage } from '@pgpmjs/core';
import { getEnvOptions } from '@pgpmjs/env';
import { createLogger } from '@pgpmjs/logger';
import { buildPgpmContext } from './context';
import type { PgpmFunctionHandler, PgpmServerOptions } from './types';

export const createPgpmFunctionServer = (
  handler: PgpmFunctionHandler<any, any>,
  options: PgpmServerOptions = {}
) => {
  // Initialize shared resources once at server startup (not per-request)
  const env = process.env as Env;
  const cwd = options.cwd || env.PGPM_CWD || process.cwd();
  const project = new PgpmPackage(cwd);
  const pgpmOptions = getEnvOptions();
  const log = createLogger(options.name || 'fn-pgpm');

  const resources = { project, options: pgpmOptions, log, env };

  return createServer(handler, (headers: RequestHeaders) =>
    buildPgpmContext(headers, resources)
  );
};
