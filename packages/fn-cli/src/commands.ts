import * as fs from 'fs';
import * as path from 'path';
import { FnClient } from '@constructive-io/fn-client';
import { Templatizer } from 'genomic';
import type { ParsedArgs } from 'minimist';

export type CommandFn = (args: ParsedArgs) => number | Promise<number>;

const buildClient = (args: ParsedArgs): FnClient =>
  new FnClient({
    rootDir: typeof args.root === 'string' ? args.root : undefined,
    config: typeof args.config === 'string' ? args.config : undefined,
  });

/**
 * Bundled handler templates. Two candidate paths cover both layouts:
 *   - `..` matches when running from source (ts-jest, dist/) where templates/
 *     lives at the package root, sibling to dist/ and src/.
 *   - `.` matches the published package shape, where publishConfig.directory
 *     is "dist" so the package root *is* dist/ and templates/ has been copied
 *     in during build.
 */
const TEMPLATE_CANDIDATES = [
  path.resolve(__dirname, '..', 'templates', 'handler'),
  path.resolve(__dirname, 'templates', 'handler'),
];
const TEMPLATES_ROOT =
  TEMPLATE_CANDIDATES.find((p) => fs.existsSync(p)) ?? TEMPLATE_CANDIDATES[0];

const KNOWN_HANDLER_TYPES = ['node-graphql', 'python'] as const;
type HandlerType = (typeof KNOWN_HANDLER_TYPES)[number];

const isHandlerType = (s: string): s is HandlerType =>
  (KNOWN_HANDLER_TYPES as readonly string[]).includes(s);

const detectNoTty = (args: ParsedArgs): boolean =>
  Boolean(
    args['no-tty'] ||
      args.noTty ||
      args.tty === false ||
      process.env.CI === 'true'
  );

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

const cmdInit: CommandFn = async (args) => {
  // Positional name first, then --name flag.
  const positional = typeof args._[1] === 'string' ? args._[1] : undefined;
  const name = positional ?? (typeof args.name === 'string' ? args.name : '');
  if (!name) {
    process.stderr.write(
      'fn init: function name is required (positional or --name=<name>)\n'
    );
    return 1;
  }

  const type = typeof args.type === 'string' ? args.type : 'node-graphql';
  if (!isHandlerType(type)) {
    process.stderr.write(
      `Unknown type "${type}". Available: ${KNOWN_HANDLER_TYPES.join(', ')}\n`
    );
    return 1;
  }

  const templateDir = path.join(TEMPLATES_ROOT, type);
  if (!fs.existsSync(templateDir)) {
    process.stderr.write(
      `Bundled template missing at ${templateDir}. Reinstall @constructive-io/fn-cli.\n`
    );
    return 1;
  }

  const client = buildClient(args);
  const functionsDir = client.config.functionsDir
    ? path.resolve(client.rootDir, client.config.functionsDir)
    : path.resolve(client.rootDir, 'functions');
  const outDir = path.join(functionsDir, name);

  if (fs.existsSync(outDir) && !args.force) {
    process.stderr.write(
      `${path.relative(client.rootDir, outDir) || outDir} already exists. Pass --force to overwrite.\n`
    );
    return 1;
  }

  // Genomic strips the ____ wrapping when matching argv keys, so plain
  // names ('name', 'description', …) are the right shape. version defaults
  // to 0.1.0 from the .boilerplate.json; users can edit handler.json after.
  const argv: Record<string, string> = {
    name,
    version: '0.1.0',
    description: typeof args.description === 'string' ? args.description : '',
  };

  const templatizer = new Templatizer();
  await templatizer.process(templateDir, outDir, {
    argv,
    noTty: detectNoTty(args),
  });

  const written = fs
    .readdirSync(outDir)
    .map((f) => path.join(path.relative(client.rootDir, outDir) || outDir, f));
  process.stdout.write(`Created ${name} (${type}):\n`);
  for (const f of written) process.stdout.write(`  + ${f}\n`);
  process.stdout.write('Next: run `fn generate` to stamp out workspace packages.\n');
  return 0;
};

export const commands: Record<string, CommandFn> = {
  init: cmdInit,
  generate: cmdGenerate,
  build: cmdBuild,
  dev: cmdDev,
  manifest: cmdManifest,
  verify: cmdVerify,
};
