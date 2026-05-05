# @constructive-io/fn-client

Programmatic client for the Constructive Functions toolkit. Composes `@constructive-io/fn-generator` with config loading, manifest readers, and child-process orchestration so a host repo (or a thin CLI) can drive the whole pipeline from one object.

## Usage

```ts
import { FnClient } from '@constructive-io/fn-client';

const client = new FnClient({
  rootDir: process.cwd(),         // default
  config: { functionsDir: 'functions', outputDir: 'generated' },
});

// 1. Generate workspace packages, k8s manifests, configmaps, skaffold.yaml.
client.generate();

// 2. Build the generated packages (runs `pnpm -r build`).
await client.build();

// 3. Start functions as local Node processes; stop them when done.
const dev = client.dev({
  env: { GRAPHQL_URL: 'http://localhost:3002/graphql' },
});

await new Promise((r) => process.once('SIGINT', r));
await dev.stop();
```

## Surface

- `discover(only?)` — list discovered functions with resolved port/type.
- `generate(opts?)` — run the full generator pipeline (delegates to `FnGenerator`).
- `loadManifest()` — read the on-disk `functions-manifest.json`.
- `defaultProcessDefs()` — derive `DevProcessDef[]` from the manifest (one per function, pointing at `<outputDir>/<dir>/dist/index.js`).
- `build(opts?)` — `pnpm -r build`, optionally filtered.
- `dev(opts?)` — spawn process defs as `node` children, return a `DevHandle` with `pids` and `stop()`.

The job-service is optional: pass `dev({ jobService: { name, script, port, env } })` to start it alongside the functions; omit to run functions only.
