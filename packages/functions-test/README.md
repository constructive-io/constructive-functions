# @constructive-io/functions-test

Testing framework for constructive-functions — isolated databases, savepoint isolation, pgpm seeding, role switching, and job queue helpers.

Built on top of [`pgsql-test`](https://www.npmjs.com/package/pgsql-test) from the Constructive monorepo.

## Quick Start

```ts
import { getConnections, asRole, addJob, waitForJob } from '@constructive-io/functions-test';
import type { PgTestClient } from '@constructive-io/functions-test';

let pg: PgTestClient;
let db: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
});

afterAll(() => teardown());
beforeEach(async () => { await pg.beforeEach(); await db.beforeEach(); });
afterEach(async () => { await db.afterEach(); await pg.afterEach(); });

test('platform_compute_log table exists', async () => {
  const row = await pg.one(`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'constructive_compute_public'
      AND table_name = 'platform_compute_log'
  `);
  expect(row).toBeTruthy();
});
```

## API

### `getConnections(opts?)`

Creates an isolated UUID-named test database and deploys pgpm modules.

```ts
const { pg, db, teardown } = await getConnections({
  modules: 'all',        // 'all' (default), 'all+seeds', or string[]
  connectionOpts: {},    // pgsql-test connection options
  extraSeeds: [],        // additional seed adapters
});
```

- `pg` — superuser client for bootstrap and catalog inspection
- `db` — RLS-enforced client running as `authenticated` role
- `teardown()` — closes connections and drops the test database

### `asRole(client, role, claims, fn)`

Execute a callback as a specific PostgreSQL role with JWT claims.

```ts
await asRole(db, 'authenticated', { database_id: id }, async () => {
  const rows = await db.any('SELECT * FROM ...');
});
```

### `addJob(client, taskIdentifier, payload?, opts?)`

Insert a job into `app_jobs.jobs`.

### `waitForJob(client, jobId, timeoutMs?, pollMs?)`

Poll until a job completes, permanently fails, or times out.

## Modules

By default, `getConnections()` deploys all schema modules:

1. `constructive-users`
2. `constructive-infra`
3. `constructive-objects`
4. `constructive-storage`
5. `constructive-store`
6. `constructive-compute`
7. `constructive-platform-function-graph`

Use `modules: 'all+seeds'` to also deploy fixture modules (`constructive-platform-seed`, `constructive-infra-seed`, `constructive-infra-services`).

## Requirements

- PostgreSQL running locally (e.g., `pgpm docker start`)
- pgpm roles bootstrapped (`pgpm admin-users bootstrap --yes`)
