# Function Templating System

## Overview

The function templating system reduces each Constructive function to two user-authored files (`handler.ts` + `handler.json`) and generates all boilerplate into a separate `generated/` directory by copying and processing template files.

Templates live in `templates/<type>/` as real, readable files with `{{placeholder}}` tokens. The generator copies them, replaces placeholders, merges dependencies, and symlinks handler source. The `fn-runtime` package provides the runtime wiring: Express server via `fn-app`, per-request GraphQL clients, structured logging, and job metadata extraction.

## Directory Structure

```
constructive-functions/
  functions/                    # User-authored source (git tracked)
    example/
      handler.ts                # Business logic
      handler.json              # Metadata + dependencies + template type
    simple-email/
      handler.ts
      handler.json
    send-email-link/
      handler.ts
      handler.json
      types.d.ts                # Optional type declarations

  templates/                    # Template definitions (git tracked)
    node-graphql/               # Default template type
      package.json              # Base package.json with {{name}}, {{version}}, {{description}}
      tsconfig.json             # Static compiler config
      index.ts                  # Entry point with {{name}} placeholder
      Dockerfile                # Per-function production Docker build
      k8s/
        knative-service.yaml    # Base Knative Service manifest

  generated/                    # All generated (gitignored)
    example/
      package.json              # Merged from template + handler.json
      tsconfig.json             # Copied from template (+ .d.ts includes)
      index.ts                  # Copied from template with {{name}} replaced
      handler.ts                # Symlink -> ../../functions/example/handler.ts
      dist/                     # tsc output
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
    generate.ts                 # Template-based generator
    docker-build.ts             # Per-function Docker image builder
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

Manifest with name, version, template type, and extra npm dependencies:

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

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Function name (used in package name and k8s manifests) |
| `version` | Yes | Semver version |
| `description` | No | Description for package.json |
| `type` | No | Template type from `templates/<type>/` (default: `"node-graphql"`) |
| `dependencies` | No | Extra npm deps merged into template's base package.json |

## Templates

Templates live in `templates/<type>/` and contain real files with `{{placeholder}}` tokens.

### Placeholder Tokens

| Token | Replaced With |
|---|---|
| `{{name}}` | `manifest.name` from handler.json |
| `{{version}}` | `manifest.version` from handler.json |
| `{{description}}` | `manifest.description` from handler.json (or empty string) |

### Template Files

| File | Processing |
|---|---|
| `package.json` | Placeholder replacement + deep merge of handler.json `dependencies` |
| `tsconfig.json` | Copied verbatim + `.d.ts` filenames appended to `include` |
| `index.ts` | Placeholder replacement only |
| `Dockerfile` | Used by `scripts/docker-build.ts` (not copied to generated/) |
| `k8s/*.yaml` | Reference manifests for new functions (not copied to generated/) |

### Adding a New Template Type

1. Create `templates/<new-type>/` with package.json, tsconfig.json, index.ts
2. Optionally add Dockerfile and k8s/ manifests
3. Reference it in handler.json: `"type": "<new-type>"`

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

`scripts/generate.ts` runs during `preinstall` via Node's native type stripping (`--experimental-strip-types`). It uses only Node built-ins (no npm dependencies).

### How It Works

1. Discovers all `functions/*/handler.json` files
2. For each function, resolves the template type (default: `node-graphql`)
3. Copies template files (`package.json`, `tsconfig.json`, `index.ts`) into `generated/<name>/`
4. Replaces `{{placeholder}}` tokens with values from handler.json
5. Deep merges handler.json `dependencies` into template's `package.json`
6. Appends `.d.ts` filenames to `tsconfig.json` `include` array
7. Creates symlinks for `handler.ts` and any `.d.ts` files

### CLI Flags

| Flag | Description |
|---|---|
| `--only=<name>` | Generate only the specified function (used by per-function Dockerfile) |

### Idempotency

The generator uses `writeIfChanged()` — files are only written when content differs. Running `pnpm generate` twice produces no disk writes on the second run.

## Docker Build

Each function can be built as an independent Docker image for production deployment.

### Per-Function Dockerfile

The template Dockerfile (`templates/node-graphql/Dockerfile`) uses three stages:

1. **build**: Copies monorepo, generates the single function, installs deps, builds
2. **deploy**: Uses `pnpm deploy` to create a minimal production bundle
3. **runtime**: Clean `node:22-alpine` image with only compiled output + production deps

### Building Images

```bash
# Build all function images
pnpm docker:build

# Build a single function
make docker-build-send-email-link

# Build with custom tag
node --experimental-strip-types scripts/docker-build.ts --only=send-email-link --tag=abc1234
```

Image naming: `ghcr.io/constructive-io/<name>-fn:<tag>`

## Workflow

### Build from scratch

```bash
pnpm generate     # Copy templates, merge deps, replace placeholders
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

### Production Docker images

```bash
make docker-build                    # build all
make docker-build-send-email-link    # build one
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
