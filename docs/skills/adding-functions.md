---
name: adding-functions
description: Step-by-step guide for adding a new serverless function to the constructive-functions project
---

# Adding a New Function

## Prerequisites

- Node.js 22+, pnpm 10+
- Understanding of the `FunctionHandler` type from `@constructive-io/fn-runtime`

**Reference implementations:** See `functions/send-email/` (env vars, external packages, dry-run mode) and `functions/send-verification-link/` (GraphQL queries, context usage) as working examples.

## Step 1: Create handler.json

Create `functions/<name>/handler.json`:

```json
{
  "name": "<name>",
  "version": "1.0.0",
  "type": "node-graphql",
  "port": <next-available-port>,
  "description": "What this function does",
  "dependencies": {
    "some-package": "^1.0.0"
  }
}
```

### handler.json fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Function identifier (used in job queue, k8s service names, Docker images) |
| `version` | Yes | Semver version |
| `type` | No | Template type, defaults to `node-graphql` |
| `port` | No | Local dev port (auto-assigned from 8081+ if omitted) |
| `description` | No | Human-readable description |
| `dependencies` | No | NPM dependencies merged into the generated package.json |

**Naming convention:** The `name` field is the canonical identifier — it's used for job queue task names, k8s service/deployment names, and the generated package name (`@constructive-io/<name>-fn`). The directory name under `functions/` is just for local organization. They don't have to match (e.g., `functions/example/` has `"name": "knative-job-example"`), but keeping them consistent avoids confusion.

**Port convention:** Check existing `functions/*/handler.json` files for used ports. Pick the next available (8081, 8082, 8083, ...). Port 8080 is reserved for job-service.

## Step 2: Create handler.ts

Create `functions/<name>/handler.ts`:

```typescript
import type { FunctionHandler } from '@constructive-io/fn-runtime';

interface MyPayload {
  // Define your expected job payload
}

const handler: FunctionHandler<MyPayload> = async (params, context) => {
  // context provides: { client, meta, job, log, env }
  //   client — GraphQL client for the database's API
  //   meta — GraphQL client for metadata API
  //   job — { jobId, workerId, databaseId, actorId }
  //   log — structured logger (info, error, warn, debug)
  //   env — process.env

  // Your implementation here

  return { complete: true };
};

export default handler;
```

**Key patterns:**
- Return `{ complete: true }` on success — the job service marks the job done
- Throw an error on failure — the job service retries with backoff
- Return an error object like `{ missing: 'field' }` for validation failures that should not retry

If your function imports modules that need TypeScript type stubs, add a `types.d.ts` in the function directory:

```typescript
declare module '@some-untyped-package';
```

## Step 3: Run generate

```bash
pnpm generate
```

This produces everything in `generated/<name>/`:
- `package.json` — workspace package with merged dependencies
- `index.ts` — Express wrapper around your handler
- `tsconfig.json` + `tsconfig.esm.json` — TypeScript config
- `Dockerfile` — multi-stage production build
- `k8s/local-deployment.yaml` — K8s Deployment + Service for local dev
- `k8s/knative-service.yaml` — Knative Service for production
- `k8s/skaffold-overlay/` — per-function kustomize overlay for Skaffold
- `README.md`
- `handler.ts` — symlink to your source

It also updates:
- `skaffold.yaml` — adds a per-function profile and updates aggregate profiles
- `k8s/overlays/local-simple/job-service.yaml` — adds function to JOBS_SUPPORTED and gateway map
- `generated/functions-manifest.json` — function registry used by dev.ts

## Step 4: Install and build

```bash
pnpm install   # picks up the new workspace package
pnpm build     # builds all packages including the new function
```

## Step 5: Add unit tests

Create `functions/<name>/__tests__/handler.test.ts`:

```typescript
import { createMockContext } from '../../../tests/helpers/mock-context';

const loadHandler = () => {
  const mod = require('../handler');
  return mod.default ?? mod;
};

describe('<name> handler', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should process valid payload', async () => {
    const handler = loadHandler();
    const result = await handler({ /* test payload */ }, createMockContext());
    expect(result).toEqual({ complete: true });
  });

  it('should reject invalid payload', async () => {
    const handler = loadHandler();
    await expect(
      handler({}, createMockContext())
    ).rejects.toThrow();
  });
});
```

**Why `require()` + `resetModules()`:** Handlers often read env vars at module scope (e.g., `parseEnvBoolean(process.env.SOME_FLAG)`). Using `require()` with `jest.resetModules()` ensures each test gets a fresh module evaluation, so env var changes in `beforeEach` take effect.

Use `tests/helpers/mock-context.ts` to create test contexts. If your function uses external packages, add mocks in `tests/__mocks__/` and register them in `jest.config.ts` under `moduleNameMapper`.

Run: `pnpm test:unit`

## Step 6: Add e2e test

Create `tests/e2e/__tests__/<name>.e2e.test.ts`:

```typescript
import {
  getTestConnections,
  closeConnections,
  getDatabaseId,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs } from '../utils/jobs';

const TEST_PREFIX = 'k8s-e2e-<name>';

describe('E2E: <name>', () => {
  let pg: TestClient;
  let databaseId: string;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;
    databaseId = await getDatabaseId(pg);
  });

  afterAll(async () => {
    if (pg) await deleteTestJobs(pg, TEST_PREFIX);
    await closeConnections();
  });

  it('should process a <name> job from the queue', async () => {
    const job = await addJob(pg, databaseId, '<name>', {
      // Your test payload
    });

    expect(job.id).toBeDefined();
    const result = await waitForJobComplete(pg, job.id, { timeout: 30000 });
    expect(['completed', 'failed']).toContain(result.status);
  });
});
```

**Important:** The e2e test filename must match the function name (`<name>.e2e.test.ts`) for the CI matrix to pick it up automatically.

## Step 7: Test locally

### Option A: Docker Compose + local Node (fastest iteration)

```bash
make dev         # start postgres, mailpit, graphql-server
pnpm dev:fn --only=<name>   # run just your function
```

### Option B: Skaffold (production-like k8s)

```bash
make skaffold-dev-<name>    # deploys infra + just your function
```

## Step 8: Verify CI will work

The following CI workflows auto-discover functions — no manual edits needed:

- **docker.yaml** — discovers `functions/*/handler.json`, builds Docker image per function
- **test-k8s-deployment.yaml** — discovers functions with matching `*.e2e.test.ts`, runs per-function k8s e2e tests
- **test.yaml** — runs `pnpm test:unit` which picks up your `__tests__/` directory
- **ci.yaml** — runs `pnpm build` which builds your generated package

## Checklist

- [ ] `functions/<name>/handler.json` created with name, version, port
- [ ] `functions/<name>/handler.ts` created with `FunctionHandler` export
- [ ] `job/service/src/types.ts` — function name added to `FunctionName` union
- [ ] `job/service/src/index.ts` — entry added to `functionRegistry`
- [ ] `pnpm generate` ran successfully
- [ ] `pnpm install && pnpm build` succeeds
- [ ] Unit tests in `functions/<name>/__tests__/handler.test.ts`
- [ ] E2e test in `tests/e2e/__tests__/<name>.e2e.test.ts`
- [ ] `pnpm test:unit` passes
- [ ] Local dev works (`make dev && pnpm dev:fn --only=<name>`)
- [ ] No manual edits needed to skaffold.yaml, dev.ts, or job-service k8s config (all auto-generated)
