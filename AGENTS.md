# Constructive Functions Agent Guide

This guide helps AI agents quickly navigate the constructive-functions workspace.

## Architecture

See [docs/spec/function-templating.md](docs/spec/function-templating.md) for the full specification.

Functions use a **templating system**: developers write `handler.ts` + `handler.json` in `functions/`, and `scripts/generate.ts` produces workspace packages in `generated/` with all boilerplate.

## Quick Start

```bash
pnpm generate     # Generate generated/<name>/ from functions/*/handler.json
pnpm install      # Install deps (preinstall runs generate.ts automatically)
pnpm build        # Build all packages + functions
```

## Monorepo Layout

```
functions/              # User-authored source (git tracked)
  <name>/
    handler.ts          # Business logic (default export)
    handler.json        # Metadata + dependencies
    *.d.ts              # Optional type declarations

generated/              # Generated workspace packages (gitignored)
  <name>/
    package.json        # Workspace package
    tsconfig.json       # Compiler config
    index.ts            # Entry point
    handler.ts          # Symlink -> functions/<name>/handler.ts
    dist/               # Compiled output

packages/
  fn-app/               # Express app factory with job callbacks
  fn-runtime/           # Runtime: createFunctionServer, GraphQL clients, context

job/
  server/               # Callback receiver
  worker/               # Job dispatcher
  service/              # Orchestrator (loads functions + worker + scheduler)

scripts/
  generate.ts           # Generator script (runs via Node's native type stripping)

k8s/                    # Kubernetes manifests and overlays
```

## Function Pattern

Each function exports a `FunctionHandler` that receives params and a context:

```typescript
import type { FunctionHandler } from '@constructive-io/fn-runtime';

const handler: FunctionHandler = async (params, context) => {
  const { client, meta, log, env, job } = context;
  // client/meta: GraphQL clients (tenant-scoped, created per-request)
  // log: structured logger
  // env: process.env
  // job: { jobId, workerId, databaseId }
  return { complete: true };
};

export default handler;
```

## Entry Points

- Function handlers: `functions/*/handler.ts`
- Generated entry points: `generated/*/index.ts` (compiled to `generated/*/dist/index.js`)
- Job orchestrator: `job/service/src/index.ts`
- Generator script: `scripts/generate.ts`

## Common Workflows

**Add a new function:**
1. Create `functions/<name>/handler.json` with name, version, dependencies
2. Create `functions/<name>/handler.ts` with default export
3. Run `pnpm generate && pnpm install && pnpm build`
4. Add to function registry in `job/service/src/index.ts` if needed

**Local development with Docker:**
```bash
make dev          # docker compose up (postgres + job-service)
make dev-down     # docker compose down
```

**Regenerate after changing handler.json:**
```bash
pnpm generate     # Regenerates package.json, tsconfig, index.ts, symlinks
pnpm install      # Picks up any new dependencies
pnpm build        # Recompile
```

## Key Details

- Functions run on `PORT=8080` (Knative default)
- Email functions support dry-run via `SIMPLE_EMAIL_DRY_RUN` / `SEND_EMAIL_LINK_DRY_RUN`
- `loadFunctionApp()` in job/service resolves modules by name (e.g. `@constructive-io/simple-email-fn`)
- GraphQL clients require `GRAPHQL_URL` env var and `X-Database-Id` header
- The `generated/` directory is entirely gitignored
