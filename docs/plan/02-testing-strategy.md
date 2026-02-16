# WS2: Testing Strategy

**Branch**: `feat/testing`
**Dependencies**: Layer 1 — none; Layer 2 — benefits from WS3 (registry); Layer 3 — needs WS1 (Docker CI)
**Estimated files**: 10+ new, 1 modified

## Context

The repo has no test framework or test files. The only CI test is `.github/workflows/test-k8s-deployment.yaml` which installs Knative in a kind cluster and applies kustomize overlays — it never actually invokes a function or tests business logic.

### Current function structure

Each function has:
- `functions/<name>/handler.ts` — business logic, exports `FunctionHandler<Params>`
- `generated/<name>/index.ts` — wraps handler via `createFunctionServer(handler, { name })`
- `packages/fn-runtime/src/server.ts` — Express POST handler that extracts headers, builds context, calls handler
- `packages/fn-runtime/src/types.ts` — `FunctionContext` type: `{ job, client, meta, log, env }`

### Handler testing challenges

**simple-email** (`functions/simple-email/handler.ts`):
- Lines 30-31: `isDryRun` and `useSmtp` read from `process.env` at **module load time** (top-level `const`)
- Tests must set env vars BEFORE importing the handler, or use `vi.stubEnv()` + dynamic `import()`
- Mocks needed: `sendPostmaster`, `sendSmtp` from imported modules

**send-email-link** (`functions/send-email-link/handler.ts`):
- Lines 73-74: `isDryRun` and `useSmtp` read from `context.env` (not process.env) — per-request, easier to test
- Makes GraphQL calls: `meta.request(GetDatabaseInfo)` and `client.request(GetUser)`
- Tests mock GraphQL client responses to control site/user data
- Complex URL construction logic per email type (lines 165-218)

**example** (`functions/example/handler.ts`):
- Simple: returns payload with fn name, throws if `params.throw` is true
- No external deps or env vars

## Requirements

1. Test framework: Vitest (lightweight, native TypeScript, fast)
2. Layer 1: Unit tests for each handler function with mocked FunctionContext
3. Layer 2: Integration tests starting real Express servers, testing HTTP request/response
4. Layer 3: E2E K8s tests invoking functions through Knative (deferred)
5. CI workflow running unit + integration tests on PR and push to main
6. Test scripts in root package.json

## Implementation

### 1. Install Vitest

Add to root `package.json` devDependencies:
```json
{
  "devDependencies": {
    "vitest": "^3.0.0"
  }
}
```

Add scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run functions",
    "test:integration": "vitest run tests/integration"
  }
}
```

### 2. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: [
      'functions/*/__tests__/**/*.test.ts',
      'tests/**/*.test.ts'
    ],
    exclude: ['node_modules', 'generated', 'dist']
  }
});
```

### 3. Layer 1: Unit Tests

#### `tests/unit/helpers/mock-context.ts`

Shared mock factory based on `FunctionContext` from `packages/fn-runtime/src/types.ts`:

```typescript
import type { FunctionContext } from '@constructive-io/fn-runtime';
import { vi } from 'vitest';

type MockContextOptions = {
  env?: Record<string, string | undefined>;
  jobId?: string;
  workerId?: string;
  databaseId?: string;
  clientResponse?: any;
  metaResponse?: any;
};

export const createMockContext = (
  options: MockContextOptions = {}
): FunctionContext => {
  const {
    env = {},
    jobId = 'test-job-id',
    workerId = 'test-worker-id',
    databaseId = 'test-database-id',
    clientResponse = {},
    metaResponse = {}
  } = options;

  return {
    job: { jobId, workerId, databaseId },
    client: {
      request: vi.fn().mockResolvedValue(clientResponse)
    } as any,
    meta: {
      request: vi.fn().mockResolvedValue(metaResponse)
    } as any,
    log: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    },
    env
  };
};
```

#### `functions/example/__tests__/handler.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createMockContext } from '../../../tests/unit/helpers/mock-context';
import handler from '../handler';

describe('example handler', () => {
  it('returns expected shape with payload echoed', async () => {
    const ctx = createMockContext();
    const result = await handler({ hello: 'world' }, ctx);
    expect(result).toMatchObject({
      fn: 'example-fn',
      body: { hello: 'world' }
    });
  });

  it('throws when params.throw is true', async () => {
    const ctx = createMockContext();
    await expect(handler({ throw: true }, ctx)).rejects.toThrow();
  });
});
```

#### `functions/simple-email/__tests__/handler.test.ts`

Key challenge: `isDryRun` and `useSmtp` are module-level constants (lines 30-31). Use `vi.stubEnv()` and dynamic import with `vi.resetModules()`.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockContext } from '../../../tests/unit/helpers/mock-context';

// Mock the email send modules
vi.mock('simple-smtp-server', () => ({
  send: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('@constructive-io/postmaster', () => ({
  send: vi.fn().mockResolvedValue(undefined)
}));

describe('simple-email handler', () => {
  let handler: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('SIMPLE_EMAIL_DRY_RUN', 'false');
    vi.stubEnv('EMAIL_SEND_USE_SMTP', 'false');
    const mod = await import('../handler');
    handler = mod.default;
  });

  it('throws on missing "to" field', async () => {
    const ctx = createMockContext();
    await expect(
      handler({ subject: 'test', html: '<p>hi</p>' }, ctx)
    ).rejects.toThrow("Missing required field 'to'");
  });

  it('throws on missing "subject" field', async () => {
    const ctx = createMockContext();
    await expect(
      handler({ to: 'test@example.com', html: '<p>hi</p>' }, ctx)
    ).rejects.toThrow("Missing required field 'subject'");
  });

  it('throws when neither html nor text provided', async () => {
    const ctx = createMockContext();
    await expect(
      handler({ to: 'test@example.com', subject: 'test' }, ctx)
    ).rejects.toThrow("Either 'html' or 'text' must be provided");
  });

  it('returns { complete: true } on valid payload', async () => {
    const ctx = createMockContext();
    const result = await handler(
      { to: 'test@example.com', subject: 'Hello', html: '<p>hi</p>' },
      ctx
    );
    expect(result).toEqual({ complete: true });
  });

  it('uses MAILGUN_FROM as fallback when from not in payload', async () => {
    vi.resetModules();
    vi.stubEnv('MAILGUN_FROM', 'noreply@example.com');
    vi.stubEnv('EMAIL_SEND_USE_SMTP', 'false');
    const mod = await import('../handler');
    const result = await mod.default(
      { to: 'test@example.com', subject: 'Hello', html: '<p>hi</p>' },
      createMockContext()
    );
    expect(result).toEqual({ complete: true });
    // Verify postmaster.send was called with from: 'noreply@example.com'
  });

  describe('dry-run mode', () => {
    beforeEach(async () => {
      vi.resetModules();
      vi.stubEnv('SIMPLE_EMAIL_DRY_RUN', 'true');
      const mod = await import('../handler');
      handler = mod.default;
    });

    it('logs but does not send email', async () => {
      const ctx = createMockContext();
      const result = await handler(
        { to: 'test@example.com', subject: 'Hello', html: '<p>hi</p>' },
        ctx
      );
      expect(result).toEqual({ complete: true });
      // Verify neither send function was called
    });
  });
});
```

#### `functions/send-email-link/__tests__/handler.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockContext } from '../../../tests/unit/helpers/mock-context';

vi.mock('simple-smtp-server', () => ({
  send: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('@constructive-io/postmaster', () => ({
  send: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('@launchql/mjml', () => ({
  generate: vi.fn().mockReturnValue('<html>mock</html>')
}));

const mockSiteData = {
  database: {
    sites: {
      nodes: [{
        domains: { nodes: [{ subdomain: 'app', domain: 'example.com' }] },
        logo: { url: 'https://example.com/logo.png' },
        title: 'Test App',
        siteThemes: { nodes: [{ theme: { primary: '#000' } }] },
        siteModules: {
          nodes: [{
            data: {
              emails: { support: 'support@example.com' },
              company: { website: 'https://example.com', nick: 'TestApp', name: 'Test Inc' }
            }
          }]
        }
      }]
    }
  }
};

describe('send-email-link handler', () => {
  let handler: any;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../handler');
    handler = mod.default;
  });

  it('returns error for missing email_type', async () => {
    const ctx = createMockContext({ metaResponse: mockSiteData });
    const result = await handler({ email: 'test@example.com' }, ctx);
    expect(result).toEqual({ missing: 'email_type' });
  });

  it('returns error for missing email', async () => {
    const ctx = createMockContext({ metaResponse: mockSiteData });
    const result = await handler({ email_type: 'invite_email' }, ctx);
    expect(result).toEqual({ missing: 'email' });
  });

  it('throws for missing databaseId', async () => {
    const ctx = createMockContext({ databaseId: undefined });
    const result = await handler(
      { email_type: 'invite_email', email: 'test@example.com' },
      ctx
    );
    expect(result).toEqual({
      error: 'Missing X-Database-Id header or DEFAULT_DATABASE_ID'
    });
  });

  describe('invite_email', () => {
    it('throws on missing invite_token or sender_id', async () => {
      const ctx = createMockContext({ metaResponse: mockSiteData });
      await expect(
        handler({
          email_type: 'invite_email',
          email: 'test@example.com',
          invite_token: 'tok123'
          // missing sender_id
        }, ctx)
      ).rejects.toThrow('Missing required field');
    });

    it('fetches user info and sends invite email', async () => {
      const ctx = createMockContext({
        metaResponse: mockSiteData,
        clientResponse: { user: { displayName: 'Alice', username: 'alice' } }
      });
      const result = await handler({
        email_type: 'invite_email',
        email: 'test@example.com',
        invite_token: 'tok123',
        sender_id: 'user-uuid'
      }, ctx);
      expect(result).toMatchObject({ complete: true });
      expect(ctx.meta.request).toHaveBeenCalled();
      expect(ctx.client.request).toHaveBeenCalled();
    });
  });

  describe('forgot_password', () => {
    it('sends password reset email', async () => {
      const ctx = createMockContext({ metaResponse: mockSiteData });
      const result = await handler({
        email_type: 'forgot_password',
        email: 'test@example.com',
        user_id: 'user-uuid',
        reset_token: 'reset-tok'
      }, ctx);
      expect(result).toMatchObject({ complete: true });
    });
  });

  describe('email_verification', () => {
    it('sends verification email', async () => {
      const ctx = createMockContext({ metaResponse: mockSiteData });
      const result = await handler({
        email_type: 'email_verification',
        email: 'test@example.com',
        email_id: 'email-uuid',
        verification_token: 'verify-tok'
      }, ctx);
      expect(result).toMatchObject({ complete: true });
    });
  });

  describe('dry-run mode', () => {
    it('logs but does not send when DRY_RUN is true', async () => {
      const ctx = createMockContext({
        metaResponse: mockSiteData,
        env: { SEND_EMAIL_LINK_DRY_RUN: 'true' }
      });
      const result = await handler({
        email_type: 'forgot_password',
        email: 'test@example.com',
        user_id: 'user-uuid',
        reset_token: 'reset-tok'
      }, ctx);
      expect(result).toMatchObject({ complete: true, dryRun: true });
    });
  });
});
```

### 4. Layer 2: Integration Tests

#### `tests/integration/helpers/start-function.ts`

```typescript
import type { Server } from 'http';

type StartedServer = {
  server: Server;
  url: string;
  close: () => Promise<void>;
};

export const startFunction = (
  modulePath: string,
  port: number
): Promise<StartedServer> => {
  // Clear require cache for fresh module load
  delete require.cache[require.resolve(modulePath)];

  const mod = require(modulePath);
  const app = mod.default ?? mod;

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve({
        server,
        url: `http://localhost:${port}`,
        close: () =>
          new Promise<void>((r, rej) =>
            server.close((err: any) => (err ? rej(err) : r()))
          )
      });
    });
    server.on('error', reject);
  });
};
```

#### `tests/integration/runtime.test.ts`

Tests the fn-runtime HTTP layer using the example function (simplest handler, no external deps).

```typescript
import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { startFunction } from './helpers/start-function';
import path from 'path';

const EXAMPLE_MODULE = path.resolve(
  __dirname,
  '../../generated/example/dist/index.js'
);
const PORT = 19876; // Arbitrary high port for tests

describe('fn-runtime HTTP layer', () => {
  let url: string;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const started = await startFunction(EXAMPLE_MODULE, PORT);
    url = started.url;
    close = started.close;
  });

  afterAll(async () => {
    await close();
  });

  it('POST / returns 200 with handler result', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ fn: 'example-fn' });
  });

  it('passes job headers through to handler context', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Job-Id': 'job-123',
        'X-Worker-Id': 'worker-456',
        'X-Database-Id': 'db-789'
      },
      body: JSON.stringify({})
    });
    expect(res.status).toBe(200);
  });

  it('handler error returns structured error response', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ throw: true })
    });
    // fn-app error middleware returns 200 with { message: ... }
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('message');
  });
});
```

### 5. CI Workflow

#### Create `.github/workflows/test.yaml`

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch: {}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  unit:
    name: Unit tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install pnpm
        run: npm install -g pnpm@10.12.2
      - name: Install dependencies
        run: pnpm install
      - name: Build
        run: pnpm build
      - name: Run unit tests
        run: pnpm test:unit

  integration:
    name: Integration tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install pnpm
        run: npm install -g pnpm@10.12.2
      - name: Install dependencies
        run: pnpm install
      - name: Build
        run: pnpm build
      - name: Run integration tests
        run: pnpm test:integration
```

### 6. Layer 3: E2E/K8s Tests (deferred)

After WS1 (Docker CI) is merged, extend `.github/workflows/test-k8s-deployment.yaml`:

1. After "Apply CI overlay" step, add:
   - Build function Docker images: `make docker-build`
   - Load into kind: `kind load docker-image ghcr.io/constructive-io/<name>-fn:local --name local`
   - Apply function Knative services from generated manifests
   - Wait for ksvc to become ready
   - Invoke via curl: `curl -X POST -H 'Content-Type: application/json' -d '{"hello":"world"}' http://<function-url>/`
   - Assert response contains expected fields

This layer requires both Docker images (WS1) and Knative services to be working.

## Files Summary

| Action | File |
|--------|------|
| Create | `vitest.config.ts` |
| Create | `.github/workflows/test.yaml` |
| Create | `tests/unit/helpers/mock-context.ts` |
| Create | `functions/example/__tests__/handler.test.ts` |
| Create | `functions/simple-email/__tests__/handler.test.ts` |
| Create | `functions/send-email-link/__tests__/handler.test.ts` |
| Create | `tests/integration/helpers/start-function.ts` |
| Create | `tests/integration/runtime.test.ts` |
| Modify | `package.json` — add vitest devDep + test scripts |

## Verification

```bash
# Install vitest
pnpm install

# Run unit tests
pnpm test:unit

# Build first (integration tests need compiled output)
pnpm build

# Run integration tests
pnpm test:integration

# Run all tests
pnpm test
```

Expected: All unit tests pass (mocked, no external deps), integration tests pass (starts real servers on localhost).
