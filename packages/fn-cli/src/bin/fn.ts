#!/usr/bin/env node
import { run } from '../cli';

run().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`fn: ${err?.message ?? err}\n`);
    process.exit(1);
  }
);
