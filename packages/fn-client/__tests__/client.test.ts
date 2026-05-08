import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FnClient } from '../src';

const ROOT = path.resolve(__dirname, '..', '..', '..');

describe('FnClient', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-client-test-'));
    fs.symlinkSync(path.join(ROOT, 'functions'), path.join(tmpRoot, 'functions'));
    fs.symlinkSync(path.join(ROOT, 'templates'), path.join(tmpRoot, 'templates'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('discovers functions in fs.readdirSync order', () => {
    const client = new FnClient({ rootDir: tmpRoot });
    const fns = client.discover();
    const names = fns.map((f) => f.name);
    expect(names).toContain('simple-email');
    expect(names).toContain('send-email-link');
    expect(fns.every((f) => f.port > 0 && f.port !== 8080)).toBe(true);
  });

  it('generate() writes a manifest that loadManifest() can read', () => {
    const client = new FnClient({ rootDir: tmpRoot });
    const result = client.generate();
    expect(result.functions.length).toBeGreaterThan(0);
    const m = client.loadManifest();
    expect(m).not.toBeNull();
    expect(m!.functions.map((f) => f.name).sort()).toEqual(
      result.functions.map((f) => f.name).sort()
    );
  });

  it('defaultProcessDefs() builds one entry per function pointing at dist/index.js', () => {
    const client = new FnClient({ rootDir: tmpRoot });
    client.generate();
    const defs = client.defaultProcessDefs();
    expect(defs.length).toBe(client.discover().length);
    for (const def of defs) {
      expect(def.script).toMatch(/dist\/index\.js$/);
      expect(typeof def.port).toBe('number');
    }
  });
});
