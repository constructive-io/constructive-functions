#!/usr/bin/env node

export { bootCompute, waitForComputePrereqs } from './index';

import { bootCompute } from './index';

if (require.main === module) {
  void bootCompute();
}
