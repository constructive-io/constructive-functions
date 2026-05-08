import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { run } from '../src/cli';

describe('fn init', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-init-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('scaffolds a node-graphql handler from the bundled template', async () => {
    const code = await run(['init', 'send-welcome', '--no-tty', '--root', tmpRoot]);
    expect(code).toBe(0);
    const handlerJson = path.join(tmpRoot, 'functions/send-welcome/handler.json');
    const handlerTs = path.join(tmpRoot, 'functions/send-welcome/handler.ts');
    expect(fs.existsSync(handlerJson)).toBe(true);
    expect(fs.existsSync(handlerTs)).toBe(true);
    const json = JSON.parse(fs.readFileSync(handlerJson, 'utf-8'));
    expect(json.name).toBe('send-welcome');
    expect(json.type).toBe('node-graphql');
    expect(json.version).toBe('0.1.0');
    const ts = fs.readFileSync(handlerTs, 'utf-8');
    expect(ts).toContain("ctx.log.info('send-welcome invoked'");
    expect(ts).toContain("import type { FunctionHandler } from '@constructive-io/fn-runtime'");
  });

  it('scaffolds a python handler when --type=python', async () => {
    const code = await run([
      'init',
      'pyfn',
      '--type',
      'python',
      '--no-tty',
      '--root',
      tmpRoot,
    ]);
    expect(code).toBe(0);
    expect(fs.existsSync(path.join(tmpRoot, 'functions/pyfn/handler.py'))).toBe(true);
    const json = JSON.parse(
      fs.readFileSync(path.join(tmpRoot, 'functions/pyfn/handler.json'), 'utf-8')
    );
    expect(json.type).toBe('python');
  });

  it('refuses to overwrite without --force', async () => {
    await run(['init', 'dup', '--no-tty', '--root', tmpRoot]);
    const code = await run(['init', 'dup', '--no-tty', '--root', tmpRoot]);
    expect(code).toBe(1);
  });

  it('overwrites with --force', async () => {
    await run(['init', 'dup', '--no-tty', '--root', tmpRoot]);
    const code = await run([
      'init',
      'dup',
      '--no-tty',
      '--force',
      '--description',
      'second',
      '--root',
      tmpRoot,
    ]);
    expect(code).toBe(0);
    const json = JSON.parse(
      fs.readFileSync(path.join(tmpRoot, 'functions/dup/handler.json'), 'utf-8')
    );
    expect(json.description).toBe('second');
  });

  it('rejects an unknown --type', async () => {
    const code = await run([
      'init',
      'broken',
      '--type',
      'rust',
      '--no-tty',
      '--root',
      tmpRoot,
    ]);
    expect(code).toBe(1);
    expect(fs.existsSync(path.join(tmpRoot, 'functions/broken'))).toBe(false);
  });

  it('errors when no name is given', async () => {
    const code = await run(['init', '--no-tty', '--root', tmpRoot]);
    expect(code).toBe(1);
  });

  it('honors a custom functionsDir from fn.config.json', async () => {
    fs.writeFileSync(
      path.join(tmpRoot, 'fn.config.json'),
      JSON.stringify({ functionsDir: 'src/handlers', outputDir: 'generated' })
    );
    const code = await run(['init', 'cfg', '--no-tty', '--root', tmpRoot]);
    expect(code).toBe(0);
    expect(
      fs.existsSync(path.join(tmpRoot, 'src/handlers/cfg/handler.json'))
    ).toBe(true);
  });
});
