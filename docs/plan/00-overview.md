# Constructive Functions — Project Overview

## Purpose

Knative function framework for Constructive: template-based code generation, shared runtime, per-function Docker images, and Kubernetes deployment manifests.

## Architecture

```
functions/           handler.json + handler.ts (user code)
    │
    ▼
templates/           Real files with {{placeholder}} tokens
    │
    ▼
scripts/generate.ts  Template copy + JSON merge + placeholder replacement
    │
    ▼
generated/           Workspace packages (package.json, index.ts, Dockerfile, k8s/)
    │                  + symlinks to handler.ts / *.d.ts
    ▼
pnpm build           TypeScript compilation → dist/
    │
    ├──► Docker image    Per-function 3-stage build (scripts/docker-build.ts)
    └──► K8s/Knative     Manifests in generated/<name>/k8s/
```

## Package Map

| Package | Path | Role |
|---------|------|------|
| `@constructive-io/fn-runtime` | `packages/fn-runtime/` | createFunctionServer(), FunctionHandler type, context building, GraphQL clients |
| `@constructive-io/knative-job-fn` | `packages/fn-app/` | Express app factory with error middleware and request logging |
| `@constructive-io/knative-job-service` | `job/service/` | KnativeJobsSvc — loads and starts functions + job orchestration |
| `@constructive-io/knative-job-server` | `job/server/` | Job callback receiver |
| `@constructive-io/knative-job-worker` | `job/worker/` | Job poller and dispatcher |
| `@constructive-io/<name>-fn` | `generated/<name>/` | Per-function packages (auto-generated) |

### Workspace config (`pnpm-workspace.yaml`)
```yaml
packages:
  - 'generated/*'
  - 'packages/*'
  - 'job/*'
```

## Key Scripts

| Command | Script | Purpose |
|---------|--------|---------|
| `pnpm generate` | `scripts/generate.ts` | Generate all function packages from templates |
| `pnpm generate -- --only=<name>` | same | Generate single function |
| `pnpm docker:build` | `scripts/docker-build.ts --all` | Build Docker images for all functions |
| `make docker-build-<name>` | `scripts/docker-build.ts --only=<name>` | Build single function image |
| `pnpm build` | `pnpm -r run build` | Compile all workspace packages |

## Common Patterns

### CJS TypeScript (Node v22+ with `--experimental-strip-types`)
```typescript
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
```
Node strips types at runtime but does NOT transform import syntax. Scripts use CJS `require()` with type assertions.

### Idempotent file writes
```typescript
function writeIfChanged(filePath: string, content: string): boolean {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing === content) return false;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}
```

### Symlinks for handler code
Generated packages symlink `handler.ts` and `*.d.ts` back to `functions/<name>/` so user code stays in one place.

## Completed Work

- [x] Template directory structure (`templates/node-graphql/` — 5 files)
- [x] Template-based generator (`scripts/generate.ts` — recursive walk, placeholder replacement, JSON merge)
- [x] Per-function Docker build script (`scripts/docker-build.ts`)
- [x] fn-runtime package (server, context, GraphQL clients, types)
- [x] fn-app package (Express factory with error middleware)
- [x] job/service (KnativeJobsSvc with function loading and job orchestration)
- [x] 3 functions: example, send-email, send-verification-link
- [x] Docker compose dev setup
- [x] K8s base manifests and overlays

## Workstreams (In Progress)

| # | Workstream | Plan File | Branch | Dependencies | Status |
|---|-----------|-----------|--------|-------------|--------|
| 1 | Docker CI | `01-docker-ci.md` | `feat/docker-ci` | None | Planned |
| 2 | Testing | `02-testing-strategy.md` | `feat/testing` | Layer 2 needs WS3; Layer 3 needs WS1 | Planned |
| 3 | Function Registry | `03-function-registry.md` | `feat/function-registry` | None | Planned |
| 4 | Env Handling | `04-env-handling.md` | `feat/env-handling` | None | Planned |

### Parallel execution
WS1, WS3, WS4 can run on separate branches simultaneously. WS2-Layer1 (unit tests) can also run in parallel. Merge order: WS1 → WS4 → WS3 → WS2 (or any order that resolves conflicts in `scripts/generate.ts` since WS3 and WS4 both modify it).

### Conflict zones
- `scripts/generate.ts` — modified by WS3 (add `generateRegistry()`) and WS4 (add `generateEnvExample()`, env validation). If implementing on separate branches, the second to merge will need a small conflict resolution in the `FunctionManifest` interface and `main()` function.
