import * as fs from 'fs';
import * as path from 'path';
import type { FnConfig } from '@constructive-io/fn-types';

const CANDIDATES = ['fn.config.json', '.fnconfig.json'];

/**
 * Load a fn config from JSON. The .ts/.js variants are deferred to a later
 * wave (will require an esbuild/jiti loader); for now supply a JSON file or
 * pass the config object directly to FnClient.
 *
 * Returns `null` if no config file is found and no explicit path was given.
 */
export const loadConfig = (configPath?: string, rootDir = process.cwd()): FnConfig | null => {
  if (configPath) {
    const abs = path.isAbsolute(configPath) ? configPath : path.resolve(rootDir, configPath);
    if (!fs.existsSync(abs)) {
      throw new Error(`fn config not found at ${abs}`);
    }
    return readConfig(abs);
  }

  for (const name of CANDIDATES) {
    const abs = path.resolve(rootDir, name);
    if (fs.existsSync(abs)) return readConfig(abs);
  }
  return null;
};

const readConfig = (abs: string): FnConfig => {
  if (abs.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(abs, 'utf-8')) as FnConfig;
  }
  throw new Error(
    `Unsupported fn config format at ${abs}. Use fn.config.json (.ts/.js loading lands in a later release).`
  );
};
