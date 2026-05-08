import type { FnConfig, FnRegistry } from '@constructive-io/fn-types';
import type { ApplyResult, FunctionInfo, GenerateOptions } from '@constructive-io/fn-generator';

export type { FnConfig, FnRegistry, ApplyResult, FunctionInfo, GenerateOptions };

export interface FnClientOptions {
  /** Repo root. Default: process.cwd(). */
  rootDir?: string;
  /** Path to a fn config file (JSON) or a literal config object. */
  config?: string | FnConfig;
}

/** A single child process that FnClient.dev() spawns. */
export interface DevProcessDef {
  name: string;
  /** Absolute path to a JS file run with `node`. */
  script: string;
  /** Port the process listens on; passed as `PORT` env. */
  port: number;
  /** Process-specific env to layer over the shared env. */
  env?: Record<string, string>;
}

export interface DevOptions {
  /** Explicit process list. If omitted, derived from the functions manifest. */
  processes?: DevProcessDef[];
  /** Filter to a single process name. */
  only?: string;
  /** Shared env layered under per-process env (over `process.env`). */
  env?: Record<string, string>;
  /** Optional job-service process to start alongside functions. */
  jobService?: DevProcessDef;
  /** Streamed log line callback. Default: console.log/.error with `[name]` prefix. */
  onLog?: (name: string, line: string, stream: 'stdout' | 'stderr') => void;
  /** Process-exit callback. Default: console.log. */
  onExit?: (name: string, code: number | null) => void;
}

export interface DevHandle {
  pids: Record<string, number | undefined>;
  /** Send SIGTERM to all children and resolve when they've all exited. */
  stop(): Promise<void>;
}

export interface BuildOptions {
  /** Filter to a single function (by directory name). */
  only?: string;
  /** Stream pnpm output to the parent stdio. Default: true. */
  inheritStdio?: boolean;
}
