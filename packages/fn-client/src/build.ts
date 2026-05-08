import { spawn } from 'child_process';
import type { BuildOptions } from './types';

/**
 * Run `pnpm -r build` (optionally filtered to a single generated package).
 * Resolves on a clean exit; rejects on non-zero status.
 */
export const runBuild = (rootDir: string, opts: BuildOptions = {}): Promise<void> => {
  const inherit = opts.inheritStdio !== false;
  const args = ['-r'];
  if (opts.only) args.push('--filter', `*${opts.only}*`);
  args.push('run', 'build');

  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, {
      cwd: rootDir,
      stdio: inherit ? 'inherit' : 'pipe',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm build exited with code ${code}`));
    });
  });
};
