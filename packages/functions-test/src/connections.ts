import { execSync } from 'child_process';
import path from 'path';
import {
  getConnections as getPgConnections,
} from 'pgsql-test';
import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { SeedAdapter } from 'pgsql-test/seed/types';

const PGPM_DIR = path.resolve(__dirname, '..', '..', '..', 'pgpm');

/**
 * All pgpm schema modules in dependency order.
 * Matches the MODULES array in scripts/up.sh.
 */
const SCHEMA_MODULES = [
  'constructive-users',
  'constructive-infra',
  'constructive-objects',
  'constructive-storage',
  'constructive-store',
  'constructive-platform-function-graph',
  'constructive-compute',
];

/**
 * Seed/fixture modules deployed after schema modules.
 * Matches the deploy order in scripts/up.sh steps 5-6.
 */
const SEED_MODULES = [
  'constructive-platform-seed',
  'constructive-infra-seed',
  'constructive-infra-services',
];

export interface FunctionsTestOptions {
  /**
   * Which pgpm modules to deploy into the isolated test DB.
   * - `'all'` deploys all schema modules in dependency order (default)
   * - `'all+seeds'` deploys all schema modules + seed/fixture modules
   * - Array of module names deploys only those specific modules
   */
  modules?: 'all' | 'all+seeds' | string[];

  /**
   * Additional pgsql-test connection options.
   */
  connectionOpts?: GetConnectionOpts;

  /**
   * Additional seed adapters to run after pgpm module deployment.
   */
  extraSeeds?: SeedAdapter[];
}

export interface FunctionsTestResult {
  /** Superuser client — for bootstrap, catalog inspection, inserting test data */
  pg: PgTestClient;
  /** RLS-enforced client — runs as 'authenticated' role by default */
  db: PgTestClient;
  /** Teardown function — closes connections and drops the test database */
  teardown: () => Promise<void>;
  /** Raw pgsql-test connection result for advanced usage */
  conn: GetConnectionResult;
}

function resolveModules(modules: FunctionsTestOptions['modules']): string[] {
  if (!modules || modules === 'all') {
    return SCHEMA_MODULES;
  }
  if (modules === 'all+seeds') {
    return [...SCHEMA_MODULES, ...SEED_MODULES];
  }
  return modules;
}

/**
 * Seed adapter that deploys multiple pgpm modules via the CLI.
 *
 * Uses `pgpm deploy --yes --database <db> --package <mod>` for each module
 * in order. This mirrors `scripts/up.sh` and handles idempotency correctly
 * (the CLI tracks deployed changes via sqitch metadata tables).
 */
function pgpmMultiModuleSeed(moduleNames: string[]): SeedAdapter {
  return {
    async seed(ctx) {
      const { host, port, database, user, password } = ctx.config;

      const env = {
        ...process.env,
        PGHOST: host ?? 'localhost',
        PGPORT: String(port ?? 5432),
        PGDATABASE: database,
        PGUSER: user ?? 'postgres',
        PGPASSWORD: password ?? 'password',
      };

      for (const mod of moduleNames) {
        const modDir = path.join(PGPM_DIR, mod);
        execSync(
          `pgpm deploy --yes --database "${database}" --package "${mod}"`,
          { cwd: modDir, env, stdio: 'pipe', timeout: 60_000 }
        );
      }
    },
  };
}

/**
 * Create an isolated test database with pgpm modules deployed.
 *
 * Returns `pg` (superuser) and `db` (authenticated role) clients
 * with savepoint-based per-test isolation.
 *
 * @example
 * ```ts
 * import { getConnections } from '@constructive-io/functions-test';
 *
 * let pg, db, teardown;
 *
 * beforeAll(async () => {
 *   ({ pg, db, teardown } = await getConnections());
 * });
 *
 * afterAll(() => teardown());
 * beforeEach(async () => { await pg.beforeEach(); await db.beforeEach(); });
 * afterEach(async () => { await db.afterEach(); await pg.afterEach(); });
 *
 * test('table exists', async () => {
 *   const row = await pg.one(`
 *     SELECT 1 FROM information_schema.tables
 *     WHERE table_name = 'platform_compute_log'
 *   `);
 *   expect(row).toBeTruthy();
 * });
 * ```
 */
export async function getConnections(
  opts: FunctionsTestOptions = {}
): Promise<FunctionsTestResult> {
  const moduleNames = resolveModules(opts.modules);
  const seedAdapters = [
    pgpmMultiModuleSeed(moduleNames),
    ...(opts.extraSeeds ?? []),
  ];

  const conn = await getPgConnections(
    opts.connectionOpts ?? {},
    seedAdapters
  );

  return {
    pg: conn.pg,
    db: conn.db,
    teardown: conn.teardown,
    conn,
  };
}
