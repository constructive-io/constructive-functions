import { FnClient } from '@constructive-io/fn-client';
import type { ParsedArgs } from 'minimist';

export type CommandFn = (args: ParsedArgs) => number | Promise<number>;

const buildClient = (args: ParsedArgs): FnClient =>
  new FnClient({
    rootDir: typeof args.root === 'string' ? args.root : undefined,
    config: typeof args.config === 'string' ? args.config : undefined,
  });

const cmdGenerate: CommandFn = (args) => {
  const client = buildClient(args);
  const result = client.generate({
    only: typeof args.only === 'string' ? args.only : undefined,
    packagesOnly: Boolean(args['packages-only']),
  });
  process.stdout.write(
    `Generated ${result.functions.length} function(s); wrote ${result.filesWritten.length} file(s), ${result.symlinksCreated.length} symlink(s).\n`
  );
  for (const f of result.filesWritten) process.stdout.write(`  + ${f}\n`);
  for (const s of result.symlinksCreated) process.stdout.write(`  ~ ${s}\n`);
  return 0;
};

const cmdBuild: CommandFn = async (args) => {
  const client = buildClient(args);
  await client.build({ only: typeof args.only === 'string' ? args.only : undefined });
  return 0;
};

const cmdDev: CommandFn = (args) => {
  const client = buildClient(args);
  const handle = client.dev({ only: typeof args.only === 'string' ? args.only : undefined });
  const stop = (): void => {
    handle.stop().finally(() => process.exit(0));
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  process.stdout.write(`Started: ${Object.keys(handle.pids).join(', ')}\n`);
  // Hold the event loop until a signal arrives.
  return new Promise<number>(() => {});
};

const cmdManifest: CommandFn = (args) => {
  const client = buildClient(args);
  const m = client.loadManifest();
  if (!m) {
    process.stderr.write('functions-manifest.json not found. Run `fn generate` first.\n');
    return 1;
  }
  process.stdout.write(JSON.stringify(m, null, 2) + '\n');
  return 0;
};

const cmdVerify: CommandFn = (args) => {
  const client = buildClient(args);
  const fns = client.discover();
  const manifest = client.loadManifest();
  if (!manifest) {
    process.stderr.write('functions-manifest.json not found. Run `fn generate` first.\n');
    return 1;
  }
  const expected = new Set(fns.map((f) => f.name));
  const actual = new Set(manifest.functions.map((f) => f.name));
  const missing = [...expected].filter((n) => !actual.has(n));
  const extra = [...actual].filter((n) => !expected.has(n));
  if (missing.length === 0 && extra.length === 0) {
    process.stdout.write(`OK: ${fns.length} function(s) in sync.\n`);
    return 0;
  }
  if (missing.length) process.stderr.write(`Missing in manifest: ${missing.join(', ')}\n`);
  if (extra.length) process.stderr.write(`Stale in manifest: ${extra.join(', ')}\n`);
  return 2;
};

export const commands: Record<string, CommandFn> = {
  generate: cmdGenerate,
  build: cmdBuild,
  dev: cmdDev,
  manifest: cmdManifest,
  verify: cmdVerify,
};
