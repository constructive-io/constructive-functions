# WS3: Dynamic Function Registry

**Branch**: `feat/function-registry`
**Dependencies**: None — can start immediately
**Approach**: HTTP-based dynamic discovery (functions self-register)

## Context

### Problem

The function registry in `job/service/src/index.ts` is hardcoded:

```typescript
// job/service/src/index.ts lines 29-43
const functionRegistry: Record<FunctionName, FunctionRegistryEntry> = {
  'send-email': {
    moduleName: '@constructive-io/send-email-fn',
    defaultPort: 8081
  },
  'send-verification-link': {
    moduleName: '@constructive-io/send-verification-link-fn',
    defaultPort: 8082
  }
};
```

And the `FunctionName` type is a hardcoded union:
```typescript
// job/service/src/types.ts line 1
export type FunctionName = 'send-email' | 'send-verification-link';
```

Functions are loaded in-process via `createRequire` (`index.ts:56-71`). Adding a new function requires editing 3 files. The current architecture tightly couples the service to specific function packages.

### Goal

Replace the hardcoded registry with HTTP-based dynamic discovery: each function starts as an independent process, registers itself with the job-service via HTTP, and the worker dispatches to registered URLs. This aligns with the K8s service mesh pattern already used in production, where functions are separate Knative services.

### Architecture flow

```
                          docker-compose up
                                |
                  +-------------+-------------+
                  |             |             |
            job-service    send-email  send-verification-link
                  |             |             |
            1. Start HTTP   2. Listen     2. Listen
               server          on :8080      on :8080
            (port 8080)        |             |
                  |        3. POST          3. POST
            Start worker    /functions/     /functions/
            + scheduler     register        register
                  |         {name,url}      {name,url}
                  |             |             |
                  +<------------+<------------+
                  |
            Registry stores:
            send-email -> http://send-email:8080
            send-verification-link -> http://send-verification-link:8080
                  |
            Worker picks job (task_identifier="send-email")
            -> registry.resolve("send-email")
            -> HTTP POST http://send-email:8080
```

## Phased Implementation

### Phase 1: Foundation (create registry + mount routes)

Create the FunctionRegistry class and mount registration HTTP endpoints on the job-service. The existing hardcoded registry and in-process loading remain functional — this is purely additive.

#### 1a. Create `job/service/src/registry.ts`

In-memory registry with HTTP routes for registration/deregistration/listing.

```typescript
import { createLogger } from '@pgpmjs/logger';

const log = createLogger('fn-registry');

export type RegisteredFunction = {
  name: string;
  url: string;
  registeredAt: Date;
};

export class FunctionRegistry {
  private functions = new Map<string, RegisteredFunction>();

  register(name: string, url: string): void {
    this.functions.set(name, { name, url, registeredAt: new Date() });
    log.info(`registered function: ${name} -> ${url}`);
  }

  unregister(name: string): boolean {
    const existed = this.functions.delete(name);
    if (existed) log.info(`unregistered function: ${name}`);
    return existed;
  }

  getUrl(name: string): string | undefined {
    return this.functions.get(name)?.url;
  }

  resolve(name: string): string {
    const url = this.getUrl(name);
    if (!url) throw new Error(`Function "${name}" not registered`);
    return url;
  }

  getAll(): RegisteredFunction[] {
    return Array.from(this.functions.values());
  }

  has(name: string): boolean {
    return this.functions.has(name);
  }

  get size(): number {
    return this.functions.size;
  }

  mountRoutes(app: { post: Function; delete: Function; get: Function }): void {
    app.post('/functions/register', (req: any, res: any) => {
      const { name, url } = req.body;
      if (!name || !url) {
        return res.status(400).json({ error: 'Missing name or url' });
      }
      this.register(name, url);
      res.status(200).json({ registered: true, name, url });
    });

    app.delete('/functions/:name', (req: any, res: any) => {
      const removed = this.unregister(req.params.name);
      res.status(200).json({ removed, name: req.params.name });
    });

    app.get('/functions', (_req: any, res: any) => {
      res.status(200).json(this.getAll());
    });
  }
}
```

#### 1b. Mount routes on job-service (`job/service/src/index.ts`)

Add registry to `KnativeJobsSvc` and mount routes in `startJobs()`. Everything else stays as-is.

```typescript
// Add import
import { FunctionRegistry } from './registry';

// Add to KnativeJobsSvc class
private registry = new FunctionRegistry();

getRegistry(): FunctionRegistry {
  return this.registry;
}

// In startJobs(), after creating jobsApp but before listenApp():
this.registry.mountRoutes(jobsApp);
```

The callback server (port 8080) now also serves:
- `POST /functions/register` — `{ name, url }` → stores in registry
- `DELETE /functions/:name` → removes from registry
- `GET /functions` → lists all registered functions

Existing `/callback` route is unaffected.

#### Phase 1 files

| Action | File |
|--------|------|
| Create | `job/service/src/registry.ts` |
| Modify | `job/service/src/index.ts` |

---

### Phase 2: Worker integration

Make the worker's URL resolution pluggable so it can use the dynamic registry.

#### 2a. `job/worker/src/req.ts` — add optional URL resolver

```typescript
export type ResolveFunctionUrl = (fn: string) => string;

interface RequestOptions {
  body: unknown;
  databaseId?: string;
  workerId: string;
  jobId: string | number;
  resolveFunctionUrl?: ResolveFunctionUrl;
}

const request = (
  fn: string,
  { body, databaseId, workerId, jobId, resolveFunctionUrl }: RequestOptions
) => {
  const url = resolveFunctionUrl ? resolveFunctionUrl(fn) : getFunctionUrl(fn);
  // ...rest unchanged
};
```

#### 2b. `job/worker/src/index.ts` — Worker accepts resolver

```typescript
constructor({ tasks, idleDelay, pgPool, workerId, resolveFunctionUrl }: {
  // ...existing options
  resolveFunctionUrl?: ResolveFunctionUrl;
}) {
  // ...existing
  this.resolveFunctionUrl = resolveFunctionUrl;
}

async doWork(job: JobRow) {
  await req(task_identifier, {
    body: payload,
    databaseId: job.database_id,
    workerId: this.workerId,
    jobId: job.id,
    resolveFunctionUrl: this.resolveFunctionUrl
  });
}
```

#### 2c. Job-service passes resolver to Worker

In `startJobs()`:

```typescript
this.worker = new Worker({
  pgPool,
  tasks,
  workerId: getWorkerHostname(),
  resolveFunctionUrl: (name: string) => this.registry.resolve(name)
});
```

**Backwards-compatible**: If no resolver is provided, falls back to existing `getFunctionUrl()` (DEV_MAP / gateway env vars).

#### Phase 2 files

| Action | File |
|--------|------|
| Modify | `job/worker/src/req.ts` |
| Modify | `job/worker/src/index.ts` |
| Modify | `job/service/src/index.ts` |

---

### Phase 3: Auto-registration in fn-runtime

Add `startWithRegistration()` to fn-runtime so functions can self-register on startup.

#### 3a. Create `packages/fn-runtime/src/register.ts`

Uses Node's built-in `http` module (no new deps). Retries registration up to 10 times with backoff. Deregisters on SIGTERM/SIGINT.

```typescript
import http from 'http';
import https from 'https';
import { createLogger } from '@pgpmjs/logger';

const log = createLogger('fn-register');

const postJson = (url: string, data: object): Promise<void> => { /* Node http.request */ };
const deleteReq = (url: string): Promise<void> => { /* Node http.request */ };

export type StartOptions = {
  name: string;
  port: number;
  selfUrl?: string;
};

export const startWithRegistration = async (
  app: { listen: (port: number, cb?: () => void) => unknown },
  options: StartOptions
): Promise<void> => {
  const { name, port } = options;
  const registryUrl = process.env.FUNCTION_REGISTRY_URL;
  const selfUrl = options.selfUrl
    || process.env.FUNCTION_SELF_URL
    || `http://localhost:${port}`;

  // 1. Start listening
  await new Promise<void>((resolve) => {
    app.listen(port, () => resolve());
  });

  // 2. Register with retry (if FUNCTION_REGISTRY_URL is set)
  if (registryUrl) {
    let registered = false;
    for (let i = 0; i < 10 && !registered; i++) {
      try {
        await postJson(registryUrl, { name, url: selfUrl });
        registered = true;
      } catch {
        await new Promise((r) => setTimeout(r, (i + 1) * 1000));
      }
    }

    // 3. Deregister on graceful shutdown
    const deregisterUrl = registryUrl.replace(/\/register$/, `/${name}`);
    process.on('SIGTERM', async () => { await deleteReq(deregisterUrl); process.exit(0); });
    process.on('SIGINT', async () => { await deleteReq(deregisterUrl); process.exit(0); });
  }
};
```

#### 3b. Export from `packages/fn-runtime/src/index.ts`

```typescript
export { startWithRegistration } from './register';
export type { StartOptions } from './register';
```

#### 3c. Update template (`templates/node-graphql/index.ts`)

```typescript
import { createFunctionServer, startWithRegistration } from '@constructive-io/fn-runtime';
import handler from './handler';

const app = createFunctionServer(handler, { name: '{{name}}' });

export default app;

if (require.main === module) {
  startWithRegistration(app, {
    name: '{{name}}',
    port: Number(process.env.PORT || 8080)
  });
}
```

When imported as a module (e.g., tests), only the app is created. When run standalone, it listens + registers.

#### Phase 3 env vars

| Variable | Description | Example |
|----------|-------------|---------|
| `FUNCTION_REGISTRY_URL` | Registration endpoint on job-service | `http://job-service:8080/functions/register` |
| `FUNCTION_SELF_URL` | This function's externally-reachable URL | `http://send-email:8080` |

#### Phase 3 files

| Action | File |
|--------|------|
| Create | `packages/fn-runtime/src/register.ts` |
| Modify | `packages/fn-runtime/src/index.ts` |
| Modify | `templates/node-graphql/index.ts` |

---

### Phase 4: Remove hardcoded registry + split docker-compose

Remove the old hardcoded registry and in-process function loading. Each function becomes its own docker-compose service.

#### 4a. Remove from `job/service/src/index.ts`

- `import { createRequire } from 'module'` (line 17)
- `FunctionRegistryEntry` type + `functionRegistry` constant (lines 29-43)
- `const requireFn = createRequire(__filename)` (line 46)
- `resolveFunctionEntry()` (lines 48-54)
- `loadFunctionApp()` (lines 56-71)
- `shouldEnableFunctions()` (lines 73-77)
- `normalizeFunctionServices()` (lines 79-91)
- `resolveFunctionPort()`, `ensureUniquePorts()` (lines 93-107)
- `startFunction()`, `startFunctions()` (lines 109-151)
- `parseList()`, `parsePortMap()`, `buildFunctionsOptionsFromEnv()` (lines 292-354)

#### 4b. Simplify types (`job/service/src/types.ts`)

```typescript
export type FunctionName = string;

export type JobsOptions = {
  enabled?: boolean;
};

export type KnativeJobsSvcOptions = {
  jobs?: JobsOptions;
};

export type KnativeJobsSvcResult = {
  jobs: boolean;
};
```

Remove: `FunctionServiceConfig`, `FunctionsOptions`, `StartedFunction`

#### 4c. Update `job/service/package.json`

Remove individual function deps (service no longer loads them):
```
"@constructive-io/send-verification-link-fn": "workspace:^"
"@constructive-io/send-email-fn": "workspace:^"
```

#### 4d. Update `docker-compose.yml`

Each function becomes its own service:

```yaml
services:
  postgres:
    # ...unchanged

  job-service:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: node job/service/dist/run.js
    environment:
      PGHOST: postgres
      PGUSER: postgres
      PGPASSWORD: password
      PGDATABASE: launchql
      CONSTRUCTIVE_JOBS_ENABLED: "true"
    depends_on:
      - postgres
    ports:
      - "8080:8080"

  send-email:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: node generated/send-email/dist/index.js
    environment:
      PORT: "8080"
      FUNCTION_REGISTRY_URL: "http://job-service:8080/functions/register"
      FUNCTION_SELF_URL: "http://send-email:8080"
    depends_on:
      - job-service
    ports:
      - "8081:8080"

  send-verification-link:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: node generated/send-verification-link/dist/index.js
    environment:
      PORT: "8080"
      FUNCTION_REGISTRY_URL: "http://job-service:8080/functions/register"
      FUNCTION_SELF_URL: "http://send-verification-link:8080"
      GRAPHQL_URL: "http://api:5000/graphql"
    depends_on:
      - job-service
    ports:
      - "8082:8080"

volumes:
  pgdata:
```

#### Phase 4 files

| Action | File |
|--------|------|
| Modify | `job/service/src/index.ts` |
| Modify | `job/service/src/types.ts` |
| Modify | `job/service/package.json` |
| Modify | `docker-compose.yml` |

---

## Verification (end-to-end after all phases)

```bash
# 1. Build
pnpm generate && pnpm install && pnpm build

# 2. Run tests
pnpm test:unit
pnpm test:integration

# 3. Docker-compose test
docker-compose up --build

# Verify registration:
curl http://localhost:8080/functions
# → [{ "name": "send-email", ... }, { "name": "send-verification-link", ... }]

# Verify registration API:
curl -X POST http://localhost:8080/functions/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"test-fn","url":"http://localhost:9999"}'
# → { "registered": true, "name": "test-fn", "url": "http://localhost:9999" }

curl -X DELETE http://localhost:8080/functions/test-fn
# → { "removed": true, "name": "test-fn" }

# 4. Verify backwards compat (Phase 2)
# Worker without resolveFunctionUrl still uses INTERNAL_GATEWAY_DEVELOPMENT_MAP
```
