# Constructive Functions Agent Guide

This guide helps AI agents quickly navigate the constructive-functions workspace.

## Architecture

See [docs/spec/function-templating.md](docs/spec/function-templating.md) for the full specification.

Functions use a **template-based system**: developers write `handler.ts` + `handler.json` in `functions/`, and `scripts/generate.ts` copies template files from `templates/<type>/` into `generated/` with placeholder replacement and dependency merging.

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
    handler.json        # Metadata + dependencies + template type
    *.d.ts              # Optional type declarations

templates/              # Template definitions (git tracked)
  node-graphql/         # Default template type
    package.json        # Base package.json with {{placeholders}}
    tsconfig.json       # Static compiler config
    index.ts            # Entry point template with {{name}}
    Dockerfile          # Per-function production Docker build
    k8s/
      knative-service.yaml  # Base Knative Service manifest

generated/              # Generated workspace packages (gitignored)
  <name>/
    package.json        # Merged from template + handler.json deps
    tsconfig.json       # Copied from template (+ .d.ts includes)
    index.ts            # Copied from template with {{name}} replaced
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
  generate.ts           # Template-based generator (copies + merges + replaces)
  docker-build.ts       # Per-function Docker image builder
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
  // job: { jobId, workerId, databaseId, actorId }
  return { complete: true };
};

export default handler;
```

## handler.json Schema

```json
{
  "name": "send-email-link",
  "version": "1.1.0",
  "description": "Sends invite, password reset, and verification emails",
  "type": "node-graphql",
  "dependencies": {
    "graphql-tag": "^2.12.6"
  }
}
```

- `type` selects the template from `templates/<type>/` (default: `"node-graphql"`)
- `dependencies` are merged into the template's base package.json

## Entry Points

- Function handlers: `functions/*/handler.ts`
- Generated entry points: `generated/*/index.ts` (compiled to `generated/*/dist/index.js`)
- Job orchestrator: `job/service/src/index.ts`
- Generator script: `scripts/generate.ts`
- Docker builder: `scripts/docker-build.ts`

## Common Workflows

**Add a new function:**
1. Create `functions/<name>/handler.json` with name, version, type, dependencies
2. Create `functions/<name>/handler.ts` with default export
3. Run `pnpm generate && pnpm install && pnpm build`
4. Add to function registry in `job/service/src/index.ts` if needed

**Build Docker images:**
```bash
make docker-build                    # build all function images
make docker-build-send-email-link    # build single function image
```

**Local development with Docker:**
```bash
make dev          # docker compose up (postgres + job-service)
make dev-down     # docker compose down
```

**Regenerate after changing handler.json:**
```bash
pnpm generate     # Copies templates, merges deps, replaces placeholders
pnpm install      # Picks up any new dependencies
pnpm build        # Recompile
```

## Key Details

- Functions run on `PORT=8080` (Knative default)
- Email functions support dry-run via `SIMPLE_EMAIL_DRY_RUN` / `SEND_EMAIL_LINK_DRY_RUN`
- `loadFunctionApp()` in job/service resolves modules by name (e.g. `@constructive-io/simple-email-fn`)
- GraphQL clients require `GRAPHQL_URL` env var and `X-Database-Id` header
- The `generated/` directory is entirely gitignored
- Templates use `{{name}}`, `{{version}}`, `{{description}}` placeholders
- Generator supports `--only=<name>` for single-function generation
