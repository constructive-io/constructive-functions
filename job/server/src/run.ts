#!/usr/bin/env node

import poolManager from '@constructive-io/job-pg';
import { getJobsCallbackPort } from '@constructive-io/job-utils';
import { createLogger } from '@pgpmjs/logger';

import server from './index';

const logger = createLogger('knative-job-server');
const pgPool = poolManager.getPool();
const port = getJobsCallbackPort();

server(pgPool).listen(port, () => {
  logger.info(`listening ON ${port}`);
});
