import { getConnections } from 'pgsql-test';
import type { SeedAdapter } from 'pgsql-test/seed/types';
import type { PgTestClient } from 'pgsql-test/test-client';

import {
  AmbiguousScopeError,
  ModuleLoader,
  ModuleNotProvisionedError,
} from '../src';

/**
 * Seed adapter that creates the metaschema tables needed by the module loader.
 * This is the minimal schema contract the loader depends on.
 */
const metaSchemaSeed: SeedAdapter = {
  async seed(ctx) {
    const { pool } = ctx;

    await pool.query(`
      CREATE SCHEMA IF NOT EXISTS metaschema_public;
      CREATE SCHEMA IF NOT EXISTS metaschema_modules_public;

      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      CREATE TABLE IF NOT EXISTS metaschema_public.database (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS metaschema_public.schema (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        database_id uuid NOT NULL REFERENCES metaschema_public.database(id),
        name text NOT NULL,
        schema_name text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS metaschema_modules_public.function_module (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        database_id uuid NOT NULL REFERENCES metaschema_public.database(id),
        schema_id uuid NOT NULL,
        private_schema_id uuid NOT NULL,
        public_schema_name text,
        private_schema_name text,
        definitions_table_name text NOT NULL DEFAULT 'function_definitions',
        secret_definitions_table_name text NOT NULL DEFAULT 'secret_definitions',
        scope text NOT NULL DEFAULT 'app',
        prefix text NOT NULL DEFAULT '',
        UNIQUE (database_id, scope, prefix)
      );

      CREATE TABLE IF NOT EXISTS metaschema_modules_public.namespace_module (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        database_id uuid NOT NULL REFERENCES metaschema_public.database(id),
        schema_id uuid NOT NULL,
        private_schema_id uuid NOT NULL,
        public_schema_name text,
        private_schema_name text,
        namespaces_table_name text NOT NULL DEFAULT 'namespaces',
        namespace_events_table_name text NOT NULL DEFAULT 'namespace_events',
        scope text NOT NULL DEFAULT 'app',
        prefix text NOT NULL DEFAULT '',
        UNIQUE (database_id, scope, prefix)
      );

      CREATE TABLE IF NOT EXISTS metaschema_modules_public.config_secrets_module (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        database_id uuid NOT NULL REFERENCES metaschema_public.database(id),
        schema_id uuid NOT NULL,
        private_schema_id uuid NOT NULL,
        public_schema_name text,
        private_schema_name text,
        table_name text NOT NULL DEFAULT 'secrets',
        scope text NOT NULL DEFAULT 'app',
        prefix text NOT NULL DEFAULT '',
        UNIQUE (database_id, scope, prefix)
      );

      CREATE TABLE IF NOT EXISTS metaschema_modules_public.storage_module (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        database_id uuid NOT NULL REFERENCES metaschema_public.database(id),
        schema_id uuid NOT NULL,
        private_schema_id uuid NOT NULL,
        public_schema_name text,
        private_schema_name text,
        buckets_table_name text NOT NULL DEFAULT 'buckets',
        files_table_name text NOT NULL DEFAULT 'files',
        scope text NOT NULL DEFAULT 'app',
        prefix text NOT NULL DEFAULT '',
        UNIQUE (database_id, scope, prefix)
      );

      CREATE TABLE IF NOT EXISTS metaschema_modules_public.function_invocation_module (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        database_id uuid NOT NULL REFERENCES metaschema_public.database(id),
        schema_id uuid NOT NULL,
        private_schema_id uuid NOT NULL,
        public_schema_name text,
        private_schema_name text,
        invocations_table_name text NOT NULL DEFAULT 'function_invocations',
        execution_logs_table_name text NOT NULL DEFAULT 'function_execution_logs',
        scope text NOT NULL DEFAULT 'app',
        prefix text NOT NULL DEFAULT '',
        UNIQUE (database_id, scope, prefix)
      );
    `);
  },
};

/**
 * Seed adapter that inserts test module data.
 */
const testDataSeed: SeedAdapter = {
  async seed(ctx) {
    const { pool } = ctx;

    // Create a test database entry
    await pool.query(`
      INSERT INTO metaschema_public.database (id, name)
      VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'test-db');
    `);

    // Create schema references
    await pool.query(`
      INSERT INTO metaschema_public.schema (id, database_id, name, schema_name)
      VALUES
        ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'compute_public', 'constructive_compute_public'),
        ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'compute_private', 'constructive_compute_private'),
        ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'infra_public', 'constructive_infra_public'),
        ('bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'infra_private', 'constructive_infra_private'),
        ('bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'store_public', 'constructive_store_public'),
        ('bbbbbbbb-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 'store_private', 'constructive_store_private'),
        ('bbbbbbbb-0000-0000-0000-000000000007', 'aaaaaaaa-0000-0000-0000-000000000001', 'objects_public', 'constructive_objects_public'),
        ('bbbbbbbb-0000-0000-0000-000000000008', 'aaaaaaaa-0000-0000-0000-000000000001', 'objects_private', 'constructive_objects_private');
    `);

    // Insert module instances
    await pool.query(`
      INSERT INTO metaschema_modules_public.function_module
        (database_id, schema_id, private_schema_id, scope, prefix, definitions_table_name, secret_definitions_table_name)
      VALUES
        ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'app', 'platform_', 'function_definitions', 'secret_definitions');
    `);

    await pool.query(`
      INSERT INTO metaschema_modules_public.namespace_module
        (database_id, schema_id, private_schema_id, scope, prefix, namespaces_table_name, namespace_events_table_name)
      VALUES
        ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000004', 'app', 'platform_', 'namespaces', 'namespace_events');
    `);

    await pool.query(`
      INSERT INTO metaschema_modules_public.config_secrets_module
        (database_id, schema_id, private_schema_id, scope, prefix, table_name)
      VALUES
        ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000006', 'app', 'platform_', 'secrets');
    `);

    await pool.query(`
      INSERT INTO metaschema_modules_public.storage_module
        (database_id, schema_id, private_schema_id, scope, prefix, buckets_table_name, files_table_name)
      VALUES
        ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000007', 'bbbbbbbb-0000-0000-0000-000000000008', 'app', 'platform_', 'buckets', 'files');
    `);

    await pool.query(`
      INSERT INTO metaschema_modules_public.function_invocation_module
        (database_id, schema_id, private_schema_id, scope, prefix, invocations_table_name, execution_logs_table_name)
      VALUES
        ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'app', 'platform_', 'function_invocations', 'function_execution_logs');
    `);
  },
};

const TEST_DB_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  const conn = await getConnections({}, [metaSchemaSeed, testDataSeed]);
  pg = conn.pg;
  teardown = conn.teardown;
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
});

describe('ModuleLoader', () => {
  let loader: ModuleLoader;

  beforeEach(() => {
    loader = new ModuleLoader({ pool: pg.pool, ttlMs: 0 });
  });

  describe('function module', () => {
    it('loads a provisioned function module', async () => {
      const config = await loader.function.load(TEST_DB_ID);
      expect(config.scope).toBe('app');
      expect(config.publicSchema).toBe('constructive_compute_public');
      expect(config.privateSchema).toBe('constructive_compute_private');
      expect(config.definitionsTable).toBe('function_definitions');
      expect(config.secretDefinitionsTable).toBe('secret_definitions');
    });

    it('returns all instances via loadAll', async () => {
      const all = await loader.function.loadAll(TEST_DB_ID);
      expect(all).toHaveLength(1);
      expect(all[0].scope).toBe('app');
    });
  });

  describe('namespace module', () => {
    it('loads a provisioned namespace module', async () => {
      const config = await loader.namespace.load(TEST_DB_ID);
      expect(config.publicSchema).toBe('constructive_infra_public');
      expect(config.privateSchema).toBe('constructive_infra_private');
      expect(config.namespacesTable).toBe('namespaces');
      expect(config.namespaceEventsTable).toBe('namespace_events');
    });
  });

  describe('secrets module', () => {
    it('loads a provisioned secrets module', async () => {
      const config = await loader.secrets.load(TEST_DB_ID);
      expect(config.publicSchema).toBe('constructive_store_public');
      expect(config.privateSchema).toBe('constructive_store_private');
      expect(config.secretsTable).toBe('secrets');
    });
  });

  describe('storage module', () => {
    it('loads a provisioned storage module', async () => {
      const config = await loader.storage.load(TEST_DB_ID);
      expect(config.publicSchema).toBe('constructive_objects_public');
      expect(config.privateSchema).toBe('constructive_objects_private');
      expect(config.bucketsTable).toBe('buckets');
      expect(config.filesTable).toBe('files');
    });
  });

  describe('invocation module', () => {
    it('loads a provisioned invocation module', async () => {
      const config = await loader.invocation.load(TEST_DB_ID);
      expect(config.publicSchema).toBe('constructive_compute_public');
      expect(config.invocationsTable).toBe('function_invocations');
      expect(config.executionLogsTable).toBe('function_execution_logs');
    });
  });

  describe('scope resolution', () => {
    it('throws ModuleNotProvisionedError for non-existent database', async () => {
      const fakeDbId = '00000000-0000-0000-0000-000000000000';
      await expect(loader.function.load(fakeDbId)).rejects.toThrow(
        ModuleNotProvisionedError
      );
    });

    it('throws ModuleNotProvisionedError for wrong scope', async () => {
      await expect(
        loader.function.load(TEST_DB_ID, 'nonexistent_scope')
      ).rejects.toThrow(ModuleNotProvisionedError);
    });

    it('throws AmbiguousScopeError when multiple instances exist without scope', async () => {
      await pg.query(`
        INSERT INTO metaschema_modules_public.function_module
          (database_id, schema_id, private_schema_id, scope, prefix, definitions_table_name, secret_definitions_table_name)
        VALUES ($1, 'bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'org', 'org_', 'org_function_definitions', 'org_secret_definitions')
      `, [TEST_DB_ID]);

      loader.invalidate(TEST_DB_ID);

      await expect(loader.function.load(TEST_DB_ID)).rejects.toThrow(
        AmbiguousScopeError
      );
    });

    it('resolves by scope when multiple instances exist', async () => {
      await pg.query(`
        INSERT INTO metaschema_modules_public.function_module
          (database_id, schema_id, private_schema_id, scope, prefix, definitions_table_name, secret_definitions_table_name)
        VALUES ($1, 'bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'org', 'org_', 'org_function_definitions', 'org_secret_definitions')
      `, [TEST_DB_ID]);

      loader.invalidate(TEST_DB_ID);

      const appConfig = await loader.function.load(TEST_DB_ID, 'app');
      expect(appConfig.scope).toBe('app');

      const orgConfig = await loader.function.load(TEST_DB_ID, 'org');
      expect(orgConfig.scope).toBe('org');
    });
  });

  describe('caching', () => {
    it('caches results within TTL', async () => {
      const loaderWithTtl = new ModuleLoader({ pool: pg.pool, ttlMs: 60_000 });

      const first = await loaderWithTtl.function.loadAll(TEST_DB_ID);
      const second = await loaderWithTtl.function.loadAll(TEST_DB_ID);
      expect(first).toBe(second); // same reference = cache hit
    });

    it('does not cache when ttlMs is 0', async () => {
      const first = await loader.function.loadAll(TEST_DB_ID);
      const second = await loader.function.loadAll(TEST_DB_ID);
      expect(first).not.toBe(second); // different reference = fresh query
    });

    it('invalidate clears cache for specific database', async () => {
      const loaderWithTtl = new ModuleLoader({ pool: pg.pool, ttlMs: 60_000 });

      const first = await loaderWithTtl.function.loadAll(TEST_DB_ID);
      loaderWithTtl.function.invalidate(TEST_DB_ID);
      const second = await loaderWithTtl.function.loadAll(TEST_DB_ID);
      expect(first).not.toBe(second);
    });

    it('facade invalidate clears all sub-loader caches', async () => {
      const loaderWithTtl = new ModuleLoader({ pool: pg.pool, ttlMs: 60_000 });

      await loaderWithTtl.function.loadAll(TEST_DB_ID);
      await loaderWithTtl.namespace.loadAll(TEST_DB_ID);

      loaderWithTtl.invalidate(TEST_DB_ID);

      const fn = await loaderWithTtl.function.loadAll(TEST_DB_ID);
      const ns = await loaderWithTtl.namespace.loadAll(TEST_DB_ID);
      // If these succeed without error, cache was cleared and re-queried
      expect(fn).toHaveLength(1);
      expect(ns).toHaveLength(1);
    });
  });
});
