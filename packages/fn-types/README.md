# @constructive-io/fn-types

Source-of-truth TypeScript types for the Constructive Functions toolkit.

This package has **no logic** — it's the contract every other `@constructive-io/fn-*` package depends on. Types are split into four areas:

- **Runtime** — `FunctionHandler`, `FunctionContext`, `ServerOptions` (used by `@constructive-io/fn-runtime` and handler authors).
- **Manifest** — `HandlerManifest` (the shape of `functions/<name>/handler.json`).
- **Config** — `FnConfig`, `FnPreset`, `K8sOptions`, `DockerOptions`, plus a `defineConfig()` helper for `fn.config.ts` files.
- **Registry** — `FnRegistry`, `FnRegistryEntry` (manifest format consumed by `@constructive-io/fn-job-service`).

## Usage in `fn.config.ts`

```ts
import { defineConfig } from '@constructive-io/fn-types';

export default defineConfig({
  functionsDir: 'functions',
  outputDir: 'generated',
  preset: 'jobs-bundle',
  registry: 'ghcr.io/my-org',
  k8s: { target: 'knative' }
});
```

## Usage in a handler

```ts
import type { FunctionHandler } from '@constructive-io/fn-types';

const handler: FunctionHandler<{ to: string }, { ok: true }> = async (params, ctx) => {
  ctx.log.info('sending', params);
  return { ok: true };
};

export default handler;
```
