# @constructive-io/fn-generator

Programmatic generator for the Constructive Functions toolkit. Given a `functions/<name>/handler.json` manifest and a set of templates, it produces:

- A workspace package per function (Dockerfile, entry point, package.json with merged deps, tsconfig, k8s YAML).
- Symlinks back to the source `handler.{ts,py}` and any auxiliary `.d.ts` / `.py` files.
- A `functions-manifest.json` registry.
- Per-function and aggregate `functions-configmap.yaml` (Knative job-service registry).
- A root `skaffold.yaml` with one profile per function plus an aggregate `local-simple` profile.

The library is **pure**: each builder returns a list of `Manifest` objects (`file` or `symlink`); `FnGenerator.apply()` is the only step that touches disk, and it does so idempotently (no rewrite if the on-disk content already matches).

## Usage

```ts
import { FnGenerator } from '@constructive-io/fn-generator';

const generator = new FnGenerator({
  rootDir: process.cwd(),                       // default
  functionsDir: 'functions',                    // default <root>/functions
  outputDir: 'generated',                       // default <root>/generated
  templatesDir: 'templates',                    // default <root>/templates
  namespace: 'constructive-functions',          // default
});

// One-shot
generator.generate();                           // all functions
generator.generate({ only: 'simple-email' });   // single
generator.generate({ packagesOnly: true });     // skip k8s/skaffold

// Or assemble manifests yourself
const fns = generator.discover();
const manifests = [
  ...generator.buildPackages(fns),
  generator.buildManifest(fns),
  ...generator.buildConfigMaps(fns),
  generator.buildSkaffold(fns),
];
const result = generator.apply(manifests);
console.log(result.filesWritten, result.symlinksCreated);
```

## Byte-identical output guarantee

`FnGenerator` is a port of the legacy `scripts/generate.ts` and is verified by a snapshot regression test against that script's output. Any change that breaks byte-identicalness is a bug.
