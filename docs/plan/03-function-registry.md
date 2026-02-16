# WS3: Auto-Generated Function Registry

**Branch**: `feat/function-registry`
**Dependencies**: None — can start immediately (env integration from WS4 is additive)
**Estimated files**: 2 modified, 3 auto-generated

## Context

### Problem

The function registry in `job/service/src/index.ts` is hardcoded:

```typescript
// job/service/src/index.ts lines 29-43
type FunctionRegistryEntry = {
  moduleName: string;
  defaultPort: number;
};

const functionRegistry: Record<FunctionName, FunctionRegistryEntry> = {
  'simple-email': {
    moduleName: '@constructive-io/simple-email-fn',
    defaultPort: 8081
  },
  'send-email-link': {
    moduleName: '@constructive-io/send-email-link-fn',
    defaultPort: 8082
  }
};
```

And the `FunctionName` type is a hardcoded union:
```typescript
// job/service/src/types.ts line 1
export type FunctionName = 'simple-email' | 'send-email-link';
```

Adding a new function requires editing 3 files: `handler.json`, `types.ts`, and `index.ts`.

### Goal

Auto-generate a `@constructive-io/fn-registry` package during `pnpm generate` that:
1. Imports all function apps
2. Exports a typed registry object
3. Exports the `FunctionName` type
4. Allows `job/service` to consume it without hardcoding

### How functions are currently loaded

`job/service/src/index.ts` lines 56-71:
```typescript
const requireFn = createRequire(__filename);

const loadFunctionApp = (moduleName: string) => {
  const knativeModuleId = requireFn.resolve('@constructive-io/knative-job-fn');
  delete requireFn.cache[knativeModuleId];
  const moduleId = requireFn.resolve(moduleName);
  delete requireFn.cache[moduleId];
  const mod = requireFn(moduleName);
  const app = mod.default ?? mod;
  if (!app || typeof app.listen !== 'function') {
    throw new Error(`Function module "${moduleName}" does not export a listenable app.`);
  }
  return app;
};
```

This uses `createRequire` + `require.resolve` for dynamic module loading. With the registry, we can import statically instead.

### How generated functions export their app

```typescript
// generated/<name>/index.ts (from template)
import { createFunctionServer } from '@constructive-io/fn-runtime';
import handler from './handler';
const app = createFunctionServer(handler, { name: '<name>' });
export default app;
```

Each `@constructive-io/<name>-fn` package exports an Express app with `.listen()`.

## Requirements

1. `pnpm generate` produces `generated/registry/` with `package.json`, `index.ts`, `tsconfig.json`
2. Registry exports all function apps with their default ports
3. `FunctionName` type is derived from the registry (no hardcoding)
4. `job/service` imports from `@constructive-io/fn-registry` instead of hardcoding
5. Adding a new `functions/<name>/handler.json` + re-running generate updates the registry automatically
6. Build passes: `pnpm generate && pnpm install && pnpm build`

## Implementation

### 1. Extend `scripts/generate.ts`

Add `generateRegistry()` function and call it at the end of `main()`.

#### New function: `generateRegistry()`

```typescript
function generateRegistry(functionNames: string[]): void {
  const registryDir = path.join(GENERATED_DIR, 'registry');
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }

  // Read all manifests
  const manifests = functionNames.map((fnName) => {
    const fnDir = path.join(FUNCTIONS_DIR, fnName);
    return readManifest(fnDir);
  });

  // --- package.json ---
  const deps: Record<string, string> = {
    '@constructive-io/fn-runtime': 'workspace:^'
  };
  for (const m of manifests) {
    deps[`@constructive-io/${m.name}-fn`] = 'workspace:^';
  }

  const pkg = {
    name: '@constructive-io/fn-registry',
    version: '1.0.0',
    description: 'Auto-generated registry of all constructive function apps',
    private: true,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc -p tsconfig.json',
      clean: 'rimraf dist'
    },
    dependencies: deps,
    devDependencies: {
      '@types/node': '^22.10.4',
      typescript: '^5.1.6'
    }
  };
  writeIfChanged(
    path.join(registryDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  );

  // --- index.ts ---
  const toVarName = (name: string): string =>
    name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

  const imports = manifests.map(
    (m) => `import ${toVarName(m.name)} from '@constructive-io/${m.name}-fn';`
  );

  const entries = manifests.map((m, i) =>
    `  '${m.name}': { app: ${toVarName(m.name)}, defaultPort: ${8081 + i} }`
  );

  const indexTs = [
    ...imports,
    '',
    'export const registry = {',
    entries.join(',\n'),
    '} as const;',
    '',
    'export type FunctionName = keyof typeof registry;',
    '',
    'export default registry;',
    ''
  ].join('\n');

  writeIfChanged(path.join(registryDir, 'index.ts'), indexTs);

  // --- tsconfig.json ---
  const tsconfig = {
    extends: '../../tsconfig.json',
    compilerOptions: { outDir: 'dist', rootDir: '.', declaration: true },
    include: ['index.ts'],
    exclude: ['dist', 'node_modules']
  };
  writeIfChanged(
    path.join(registryDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n'
  );

  console.log('  Generated registry package.');
}
```

#### Call in `main()`

At end of `main()`, before `console.log('Done.')`:

```typescript
  // Generate registry package
  generateRegistry(functions);

  console.log('Done.');
```

### 2. Generated output: `generated/registry/`

For current functions (example, send-email-link, simple-email), the generated `index.ts`:

```typescript
import knativeJobExample from '@constructive-io/knative-job-example-fn';
import sendEmailLink from '@constructive-io/send-email-link-fn';
import simpleEmail from '@constructive-io/simple-email-fn';

export const registry = {
  'knative-job-example': { app: knativeJobExample, defaultPort: 8081 },
  'send-email-link': { app: sendEmailLink, defaultPort: 8082 },
  'simple-email': { app: simpleEmail, defaultPort: 8083 }
} as const;

export type FunctionName = keyof typeof registry;

export default registry;
```

**Note on naming**: Registry keys use `manifest.name` (from handler.json), not directory names. For `example/handler.json` with `"name": "knative-job-example"`, the key is `'knative-job-example'`.

**Note on port assignment**: Ports are auto-assigned (8081 + index) in alphabetical order of function names. The existing `CONSTRUCTIVE_FUNCTION_PORTS` env var can override ports at runtime (`job/service/src/index.ts` lines 300-329).

### 3. Refactor `job/service/src/types.ts`

**Before** (line 1):
```typescript
export type FunctionName = 'simple-email' | 'send-email-link';
```

**After**:
```typescript
export type { FunctionName } from '@constructive-io/fn-registry';
```

All other types (`FunctionServiceConfig`, `FunctionsOptions`, `KnativeJobsSvcOptions`, etc.) remain unchanged — they reference `FunctionName` which is now re-exported.

### 4. Refactor `job/service/src/index.ts`

**Remove** (lines 17, 46):
```typescript
import { createRequire } from 'module';
// ...
const requireFn = createRequire(__filename);
```

**Remove** (lines 29-43):
```typescript
type FunctionRegistryEntry = { ... };
const functionRegistry: Record<FunctionName, FunctionRegistryEntry> = { ... };
```

**Remove** (lines 56-71):
```typescript
const loadFunctionApp = (moduleName: string) => { ... };
```

**Add** (near top, after other imports):
```typescript
import fnRegistry from '@constructive-io/fn-registry';
import type { FunctionName } from '@constructive-io/fn-registry';
```

**Replace** `resolveFunctionEntry()` (line 48-54):

```typescript
// Before:
const resolveFunctionEntry = (name: FunctionName): FunctionRegistryEntry => {
  const entry = functionRegistry[name];
  if (!entry) throw new Error(`Unknown function "${name}".`);
  return entry;
};

// After:
const resolveFunctionEntry = (name: FunctionName) => {
  const entry = fnRegistry.registry[name];
  if (!entry) throw new Error(`Unknown function "${name}".`);
  return entry;
};
```

**Replace** `startFunction()` (lines 109-134) — use `entry.app.listen()` directly instead of `loadFunctionApp()`:

```typescript
const startFunction = async (
  service: FunctionServiceConfig,
  functionServers: Map<FunctionName, HttpServer>
): Promise<StartedFunction> => {
  const entry = resolveFunctionEntry(service.name);
  const port = resolveFunctionPort(service);
  const app = entry.app;

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      log.info(`function:${service.name} listening on ${port}`);
      resolve();
    }) as HttpServer & { on?: (event: string, cb: (err: Error) => void) => void };

    if (server?.on) {
      server.on('error', (err) => {
        log.error(`function:${service.name} failed to start`, err);
        reject(err);
      });
    }

    functionServers.set(service.name, server);
  });

  return { name: service.name, port };
};
```

**Replace** `normalizeFunctionServices()` (lines 79-91) — use `fnRegistry.registry` instead of `functionRegistry`:

```typescript
const normalizeFunctionServices = (
  options?: FunctionsOptions
): FunctionServiceConfig[] => {
  if (!shouldEnableFunctions(options)) return [];

  if (!options?.services?.length) {
    return (Object.keys(fnRegistry.registry) as FunctionName[]).map((name) => ({
      name
    }));
  }

  return options.services;
};
```

**Replace** `resolveFunctionPort()` (lines 93-96):

```typescript
const resolveFunctionPort = (service: FunctionServiceConfig): number => {
  const entry = resolveFunctionEntry(service.name);
  return service.port ?? entry.defaultPort;
};
```

### 5. Update `job/service/package.json`

**Add** dependency:
```json
"@constructive-io/fn-registry": "workspace:^"
```

**Remove** individual function deps (if present):
```json
"@constructive-io/send-email-link-fn": "workspace:^",
"@constructive-io/simple-email-fn": "workspace:^"
```

The registry transitively depends on all function packages, so they'll still be installed.

## Files Summary

| Action | File |
|--------|------|
| Modify | `scripts/generate.ts` — add `generateRegistry()`, call at end of `main()` |
| Modify | `job/service/src/index.ts` — import from registry, remove hardcoded registry + loadFunctionApp + createRequire |
| Modify | `job/service/src/types.ts` — re-export FunctionName from registry |
| Modify | `job/service/package.json` — add fn-registry dep, remove per-fn deps |
| Generated | `generated/registry/package.json` |
| Generated | `generated/registry/index.ts` |
| Generated | `generated/registry/tsconfig.json` |

## Verification

```bash
# 1. Clean generate
rm -rf generated/
pnpm generate
# Verify: generated/registry/ exists with index.ts, package.json, tsconfig.json
cat generated/registry/index.ts
# Should show imports for all 3 functions

# 2. Full build
pnpm install
pnpm build
# Should compile all packages including registry and job/service

# 3. Test adding a new function
mkdir -p functions/test-fn
echo '{"name":"test-fn","version":"1.0.0","type":"node-graphql"}' > functions/test-fn/handler.json
cp functions/example/handler.ts functions/test-fn/handler.ts
pnpm generate
cat generated/registry/index.ts
# Should now include testFn import and registry entry

# 4. Verify runtime (if docker compose is available)
make dev
# job-service should start all functions without errors
```
