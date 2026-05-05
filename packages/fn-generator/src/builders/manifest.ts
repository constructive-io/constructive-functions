import * as path from 'path';
import type { FunctionInfo, Manifest } from '../types';

/**
 * Build the `generated/functions-manifest.json` manifest. Field order is
 * fixed (`name`, `dir`, `port`, `type`) to keep output byte-identical.
 */
export const buildManifestJson = (
  fns: FunctionInfo[],
  outputDir: string
): Manifest => {
  const data = {
    functions: fns.map((fn) => ({
      name: fn.name,
      dir: fn.dir,
      port: fn.port,
      type: fn.type,
    })),
  };
  return {
    kind: 'file',
    path: path.join(outputDir, 'functions-manifest.json'),
    content: JSON.stringify(data, null, 2) + '\n',
  };
};
