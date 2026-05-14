import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { loadFunctionRegistry } from '../../job/service/src/registry';

describe('loadFunctionRegistry', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fn-registry-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns empty when no env vars and no manifest file exist', () => {
    const reg = loadFunctionRegistry({}, tmpDir);
    expect(reg).toEqual({});
  });

  it('reads from generated/functions-manifest.json by default', () => {
    const dir = path.join(tmpDir, 'generated');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'functions-manifest.json'),
      JSON.stringify({
        functions: [
          { name: 'send-email', dir: 'send-email', port: 8081, type: 'node-graphql' },
          { name: 'send-verification-link', dir: 'send-verification-link', port: 8082, type: 'node-graphql' },
        ],
      })
    );
    const reg = loadFunctionRegistry({}, tmpDir);
    expect(reg['send-email']).toEqual({
      moduleName: '@constructive-io/send-email-fn',
      defaultPort: 8081,
    });
    expect(reg['send-verification-link']).toEqual({
      moduleName: '@constructive-io/send-verification-link-fn',
      defaultPort: 8082,
    });
  });

  it('honours FUNCTIONS_MANIFEST_PATH override', () => {
    const manifestPath = path.join(tmpDir, 'custom-manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ functions: [{ name: 'foo', port: 9000 }] })
    );
    const reg = loadFunctionRegistry({ FUNCTIONS_MANIFEST_PATH: manifestPath }, tmpDir);
    expect(reg.foo).toEqual({ moduleName: '@constructive-io/foo-fn', defaultPort: 9000 });
  });

  it('respects an explicit moduleName field in the manifest', () => {
    const manifestPath = path.join(tmpDir, 'm.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({
        functions: [{ name: 'foo', moduleName: '@my-org/foo-handler', port: 9000 }],
      })
    );
    const reg = loadFunctionRegistry({ FUNCTIONS_MANIFEST_PATH: manifestPath }, tmpDir);
    expect(reg.foo.moduleName).toBe('@my-org/foo-handler');
  });

  it('parses FUNCTIONS_REGISTRY env var (priority over manifest)', () => {
    const manifestPath = path.join(tmpDir, 'm.json');
    fs.writeFileSync(manifestPath, JSON.stringify({ functions: [{ name: 'foo', port: 1 }] }));
    const reg = loadFunctionRegistry(
      {
        FUNCTIONS_REGISTRY: 'foo:@org/foo:8081,bar:@org/bar',
        FUNCTIONS_MANIFEST_PATH: manifestPath,
      },
      tmpDir
    );
    expect(reg.foo).toEqual({ moduleName: '@org/foo', defaultPort: 8081 });
    // bar has no port → 0
    expect(reg.bar).toEqual({ moduleName: '@org/bar', defaultPort: 0 });
  });

  it('uses convention when FUNCTIONS_REGISTRY entry omits moduleName', () => {
    const reg = loadFunctionRegistry({ FUNCTIONS_REGISTRY: 'baz::8083' }, tmpDir);
    expect(reg.baz).toEqual({ moduleName: '@constructive-io/baz-fn', defaultPort: 8083 });
  });
});
