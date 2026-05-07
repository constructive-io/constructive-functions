import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CLI_BIN = path.resolve(
  __dirname,
  '..',
  '..',
  'packages',
  'fn-cli',
  'dist',
  'bin',
  'fn.js'
);

const runFn = (args: string[], cwd: string) =>
  spawnSync(process.execPath, [CLI_BIN, ...args], {
    cwd,
    env: { ...process.env, CI: 'true' },
    encoding: 'utf-8',
  });

describe('fn init (binary integration)', () => {
  let tmpRoot: string;

  beforeAll(() => {
    if (!fs.existsSync(CLI_BIN)) {
      throw new Error(
        `fn-cli binary not built. Run \`pnpm --filter @constructive-io/fn-cli build\` first. Looked at ${CLI_BIN}.`
      );
    }
  });

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-init-bin-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('scaffolds a node-graphql handler when invoked as a binary', () => {
    const result = runFn(['init', 'welcome', '--no-tty'], tmpRoot);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Created welcome (node-graphql)');
    expect(
      fs.existsSync(path.join(tmpRoot, 'functions/welcome/handler.json'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpRoot, 'functions/welcome/handler.ts'))
    ).toBe(true);
  });

  it('scaffolds a python handler', () => {
    const result = runFn(
      ['init', 'pybot', '--type', 'python', '--no-tty'],
      tmpRoot
    );
    expect(result.status).toBe(0);
    expect(
      fs.existsSync(path.join(tmpRoot, 'functions/pybot/handler.py'))
    ).toBe(true);
    const json = JSON.parse(
      fs.readFileSync(
        path.join(tmpRoot, 'functions/pybot/handler.json'),
        'utf-8'
      )
    );
    expect(json.type).toBe('python');
  });

  it('refuses to overwrite an existing function without --force', () => {
    expect(runFn(['init', 'a', '--no-tty'], tmpRoot).status).toBe(0);
    const second = runFn(['init', 'a', '--no-tty'], tmpRoot);
    expect(second.status).toBe(1);
    expect(second.stderr).toContain('already exists');
  });

  it('overwrites with --force', () => {
    expect(runFn(['init', 'b', '--no-tty'], tmpRoot).status).toBe(0);
    const second = runFn(
      [
        'init',
        'b',
        '--no-tty',
        '--force',
        '--description',
        'overwritten',
      ],
      tmpRoot
    );
    expect(second.status).toBe(0);
    const json = JSON.parse(
      fs.readFileSync(path.join(tmpRoot, 'functions/b/handler.json'), 'utf-8')
    );
    expect(json.description).toBe('overwritten');
  });

  it('fn generate finds the just-scaffolded function', () => {
    runFn(['init', 'discoverme', '--no-tty'], tmpRoot);
    // fn generate needs a templates/ dir to do its full pipeline. For
    // this binary test we only verify discovery — the scaffolded
    // handler.json is enough for the scanner to enumerate it.
    fs.mkdirSync(path.join(tmpRoot, 'templates', 'node-graphql'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(tmpRoot, 'templates', 'shared'), {
      recursive: true,
    });
    // Empty templates → generator runs but produces no per-fn files;
    // it still emits the manifest. Use --packages-only to skip k8s.
    const result = runFn(
      ['generate', '--only', 'discoverme', '--packages-only'],
      tmpRoot
    );
    expect(result.status).toBe(0);
  });
});
