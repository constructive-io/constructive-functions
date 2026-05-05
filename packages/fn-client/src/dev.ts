import { spawn, ChildProcess } from 'child_process';
import type { DevHandle, DevOptions, DevProcessDef } from './types';

const defaultLog = (name: string, line: string, stream: 'stdout' | 'stderr'): void => {
  const target = stream === 'stderr' ? console.error : console.log;
  target(`[${name}] ${line}`);
};

const defaultExit = (name: string, code: number | null): void => {
  console.log(`[${name}] exited with code ${code}`);
};

const streamLines = (
  child: ChildProcess,
  name: string,
  cb: (name: string, line: string, stream: 'stdout' | 'stderr') => void
): void => {
  child.stdout?.on('data', (data: Buffer) => {
    for (const line of data.toString().trimEnd().split('\n')) cb(name, line, 'stdout');
  });
  child.stderr?.on('data', (data: Buffer) => {
    for (const line of data.toString().trimEnd().split('\n')) cb(name, line, 'stderr');
  });
};

/**
 * Spawn the given process definitions as Node child processes and return a
 * handle to manage their lifecycle.
 *
 * The shared env (`process.env` overlaid with `opts.env`) is layered under
 * each process's `env`. `PORT` is always set from the def's `port`.
 */
export const spawnProcesses = (
  defs: DevProcessDef[],
  opts: DevOptions = {}
): DevHandle => {
  const onLog = opts.onLog ?? defaultLog;
  const onExit = opts.onExit ?? defaultExit;

  const sharedEnv = { ...process.env, ...(opts.env ?? {}) } as Record<string, string>;

  const children = new Map<string, ChildProcess>();

  for (const def of defs) {
    const env = { ...sharedEnv, ...(def.env ?? {}), PORT: String(def.port) };
    const child = spawn('node', [def.script], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    streamLines(child, def.name, onLog);
    child.on('exit', (code) => onExit(def.name, code));
    children.set(def.name, child);
  }

  const pids: Record<string, number | undefined> = {};
  for (const [name, child] of children) pids[name] = child.pid;

  const stop = async (): Promise<void> => {
    const exits: Promise<void>[] = [];
    for (const [, child] of children) {
      if (child.exitCode !== null) continue;
      exits.push(
        new Promise<void>((resolve) => {
          child.once('exit', () => resolve());
          child.kill('SIGTERM');
        })
      );
    }
    await Promise.all(exits);
  };

  return { pids, stop };
};
