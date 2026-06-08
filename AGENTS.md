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
  "name": "send-verification-link",
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
make docker-build-send-verification-link    # build single function image
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

- Each function declares its port in `handler.json` (`send-email` 8081, `send-verification-link` 8082, `knative-job-example` 8083, `python-example` 8084); the job service uses 8080
- Email functions support dry-run via `SEND_EMAIL_DRY_RUN` / `SEND_VERIFICATION_LINK_DRY_RUN` (legacy `SIMPLE_EMAIL_DRY_RUN` / `SEND_EMAIL_LINK_DRY_RUN` still honored as fallback)
- `loadFunctionApp()` in job/service resolves modules by name (e.g. `@constructive-io/send-email-fn`)
- GraphQL clients require `GRAPHQL_URL` env var and `X-Database-Id` header
- The `generated/` directory is entirely gitignored
- Templates use `{{name}}`, `{{version}}`, `{{description}}` placeholders
- Generator supports `--only=<name>` for single-function generation

## SDK / ORM Generation (`sdk/`)

Typed ORM clients over the `constructive_infra_public` schema, generated with the
same pgpm → SDL → codegen pipeline as `constructive-db` (Pattern A):

- `sdk/functions-schema` — deploys `pgpm/constructive-infra` to an **ephemeral
  Postgres**, introspects it via PostGraphile, and writes per-target SDL to
  `schemas/*.graphql`. Requires `docker.io/constructiveio/postgres-plus:18`.
- `sdk/functions-sdk` — runs `@constructive-io/graphql-codegen` over those SDL
  files to emit a typed ORM at `src/<target>/` plus the `orm-<target>` skill.

```bash
pnpm run generate:schema   # pgpm module -> ephemeral DB -> schemas/*.graphql
pnpm run generate:sdk      # schemas/*.graphql -> sdk/functions-sdk/src/*
pnpm run generate:orm      # both, in order
```

**Generated — DO NOT EDIT** (regenerate via the commands above after pgpm changes):
- `sdk/functions-schema/schemas/*.graphql`, `sdk/functions-schema/src/index.ts`
- `sdk/functions-sdk/src/**`
- `.agents/skills/orm-*/`

### CI automation

The same `pnpm run generate:orm` pipeline runs in GitHub Actions (mirrors
`constructive-db`'s generate-all / schema-sdk-update / validate-introspection):

- `.github/workflows/generate-orm.yml` — reusable (`workflow_call`/dispatch)
  single source of truth: spins up Postgres, deploys the pgpm module to an
  ephemeral DB, regenerates schema + ORM, reports drift, uploads the artifact.
- `.github/workflows/validate-orm.yml` — PR check on `pgpm/**` / `sdk/**`;
  regenerates and **fails if the committed output is stale**.
- `.github/workflows/sdk-update.yml` — manual dispatch; regenerates and opens a
  PR with the fresh output so you don't have to regenerate locally.
