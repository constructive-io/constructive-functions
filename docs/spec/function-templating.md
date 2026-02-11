# Function Templating System

## Overview

The function templating system reduces each Constructive function to two user-authored files (`handler.ts` + `handler.json`) and generates all boilerplate (package.json, tsconfig, entry point) into a separate `generated/` directory.

The `fn-runtime` package provides the runtime wiring: Express server via `fn-app`, per-request GraphQL clients, structured logging, and job metadata extraction.

## Directory Structure

```
constructive-functions/
  functions/                    # User-authored source (git tracked)
    example/
      handler.ts                # Business logic
      handler.json              # Metadata + dependencies
    simple-email/
      handler.ts
      handler.json
    send-email-link/
      handler.ts
      handler.json
      types.d.ts                # Optional type declarations

  generated/                    # All generated (gitignored)
    example/
      package.json              # Workspace package
      tsconfig.json             # Compiler config
      index.ts                  # Entry point (wires runtime + handler)
      handler.ts                # Symlink -> ../../functions/example/handler.ts
      dist/                     # tsc output
        index.js
        handler.js
    simple-email/
      ...same structure...
    send-email-link/
      ...same structure...
      types.d.ts                # Symlink -> ../../functions/send-email-link/types.d.ts

  packages/
    fn-app/                     # Express app factory with job callback handling
    fn-runtime/                 # Runtime: createFunctionServer, GraphQL clients, context

  job/
    server/                     # Callback receiver (POST /callback)
    worker/                     # Job dispatcher (polls PG, POSTs to functions)
    service/                    # Orchestrator (loads functions + worker + scheduler)

  scripts/
    generate.ts                 # Generator script (runs via Node's native type stripping)
```

## What Developers Write

### handler.ts

Exports a single async function that receives params and a context object:

```typescript
import type { FunctionHandler } from '@constructive-io/fn-runtime';

const handler: FunctionHandler = async (params, context) => {
  const { client, meta, log, env, job } = context;
  // Business logic here
  return { complete: true };
};

export default handler;
```

### handler.json

Minimal manifest with name, version, and any extra npm dependencies:

```json
{
  "name": "send-email-link",
  "version": "1.1.0",
  "description": "Sends invite, password reset, and verification emails",
  "dependencies": {
    "graphql-tag": "^2.12.6"
  }
}
```

Dependencies listed here are merged with `@constructive-io/fn-runtime` (always included) into the generated `package.json`.

## fn-runtime Package

### Public API

```typescript
// Server factory - wraps handler in Express app via fn-app
createFunctionServer(handler: FunctionHandler, options?: ServerOptions): JobApp

// GraphQL client factory - creates tenant + meta clients from headers
createClients(databaseId: string, env: Record<string, string | undefined>): { client, meta }

// Context builder - assembles FunctionContext from request headers
buildContext(headers: RequestHeaders, options?: { name?: string }): FunctionContext
```

### FunctionContext

Provided to every handler invocation:

| Field | Type | Description |
|---|---|---|
| `job.jobId` | `string?` | From `X-Job-Id` header |
| `job.workerId` | `string?` | From `X-Worker-Id` header |
| `job.databaseId` | `string?` | From `X-Database-Id` header |
| `client` | `GraphQLClient` | Tenant-scoped (X-Api-Name, X-Database-Id) |
| `meta` | `GraphQLClient` | Meta-schema queries |
| `log` | `Logger` | Structured logger scoped to function name |
| `env` | `Record<string, string?>` | `process.env` |

GraphQL clients are created per-request (databaseId varies per job). If `GRAPHQL_URL` is not set or no databaseId is present, client/meta are stubs that throw on use.

### How createFunctionServer Works

1. Calls `createJobApp()` from `fn-app` (preserves callback protocol)
2. Registers `POST /` handler that:
   - Extracts job metadata from headers
   - Builds `FunctionContext` with GraphQL clients, logger, env
   - Calls `handler(req.body, context)`
   - Returns result as JSON
3. Errors thrown by handler are caught by fn-app's error middleware and trigger failure callbacks

## Generator Script

`scripts/generate.ts` is a TypeScript script that runs during `preinstall` via Node's native type stripping (`--experimental-strip-types`).

For each `functions/*/handler.json` it generates into `generated/<name>/`:

| File | Content |
|---|---|
| `package.json` | Workspace package: name from `@constructive-io/<name>-fn`, deps merged from handler.json |
| `tsconfig.json` | Extends root tsconfig, compiles `index.ts` + `handler.ts` into `dist/` |
| `index.ts` | Entry point: imports fn-runtime + handler, creates server, exports app |
| `handler.ts` | Symlink to `../../functions/<name>/handler.ts` |
| `*.d.ts` | Symlinks to any `.d.ts` files in the function directory |

### Generated index.ts

```typescript
import { createFunctionServer } from '@constructive-io/fn-runtime';
import handler from './handler';

const app = createFunctionServer(handler, { name: "send-email-link" });

export default app;

if (require.main === module) {
  app.listen(Number(process.env.PORT || 8080));
}
```

This preserves:
- `export default app` pattern that job/service's `loadFunctionApp()` expects
- `node dist/index.js` standalone execution for containers
- Backward compatibility with existing K8s manifests

## Workflow

### Build from scratch

```bash
pnpm generate     # Generate generated/<name>/ for all functions
pnpm install      # Resolve workspace deps (preinstall runs generate.ts automatically)
pnpm build        # Compile all packages + functions
```

### Adding a new function

1. Create `functions/<name>/handler.json` with name, version, dependencies
2. Create `functions/<name>/handler.ts` with default export
3. Run `pnpm generate && pnpm install && pnpm build`
4. Add function to `job/service/src/index.ts` function registry if it should be loaded by the orchestrator

### Local development

```bash
make dev          # docker compose up (postgres + job-service with all functions)
make dev-down     # docker compose down
```

## Data Flow

```
PostgreSQL (jobs table)
    |
    |-- LISTEN "jobs:insert" (Worker)
    v
Worker polls getJob()
    |
    v
Worker.doWork(job) -- HTTP POST to function
    |
    v
generated/<name>/dist/index.js
    |-- createFunctionServer() from fn-runtime
    |-- buildContext() extracts headers, creates GraphQL clients
    |-- handler(params, context) -- YOUR CODE
    |
    v
fn-app middleware
    |-- Success: sends callback to job server
    |-- Error: sends error callback
    v
Callback Server (POST /callback)
    |-- completeJob() or failJob()
    v
PostgreSQL job status updated
```

## Environment Variables

### GraphQL (used by fn-runtime when creating clients)

| Variable | Required | Description |
|---|---|---|
| `GRAPHQL_URL` | When using GraphQL | Base URL for tenant queries |
| `META_GRAPHQL_URL` | No | URL for meta queries (defaults to GRAPHQL_URL) |
| `GRAPHQL_AUTH_TOKEN` | No | Bearer token for Authorization header |
| `GRAPHQL_HOST_HEADER` | No | Host header override for internal routing |
| `GRAPHQL_API_NAME` | No | X-Api-Name header (defaults to 'private') |
| `GRAPHQL_SCHEMATA` | No | X-Schemata header for schema routing |

### Function-specific

| Variable | Function | Description |
|---|---|---|
| `SEND_EMAIL_LINK_DRY_RUN` | send-email-link | Skip actual email sending |
| `SIMPLE_EMAIL_DRY_RUN` | simple-email | Skip actual email sending |
| `EMAIL_SEND_USE_SMTP` | both | Use SMTP instead of Mailgun |
| `DEFAULT_DATABASE_ID` | send-email-link | Fallback when X-Database-Id header is missing |
| `LOCAL_APP_PORT` | send-email-link | Port for localhost URLs in dry-run mode |

## Compatibility

The generated packages maintain full backward compatibility with:

- **job/service `loadFunctionApp()`**: Expects module to export an app with `.listen()`. The generated `index.ts` exports exactly this via `createFunctionServer()` which wraps `createJobApp()`.
- **Package names**: `@constructive-io/simple-email-fn`, `@constructive-io/send-email-link-fn` remain unchanged.
- **K8s manifests**: `node generated/<name>/dist/index.js` works as container CMD.
- **Callback protocol**: fn-runtime delegates to fn-app which handles all callback logic.
