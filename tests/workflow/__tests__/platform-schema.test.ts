/**
 * Platform Schema Verification
 *
 * Verifies that `make up` deployed all expected schemas, tables, functions,
 * indexes, and metaschema registrations. This is the "smoke test" for the
 * pgpm migration stack.
 *
 * Prerequisites: `make up` (PostgreSQL running + pgpm modules deployed)
 */
import { getTestClient, closeConnections, type TestClient } from '../utils/db';

let pg: TestClient;

beforeAll(async () => {
  pg = getTestClient();
  await pg.query('SELECT 1');
});

afterAll(async () => {
  await closeConnections();
});

describe('Platform Schema', () => {
  describe('schemas', () => {
    const expectedSchemas = [
      'constructive_compute_public',
      'constructive_compute_private',
      'constructive_infra_public',
      'constructive_users_public',
      'constructive_objects_public',
      'constructive_objects_private',
      'constructive_storage_public',
      'constructive_storage_private',
      'constructive_store_public',
      'constructive_store_private',
      'constructive_platform_function_graph_public',
      'constructive_platform_function_graph_private',
      'app_jobs',
    ];

    it.each(expectedSchemas)('schema %s exists', async (schema) => {
      const row = await pg.oneOrNone(
        `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`,
        [schema]
      );
      expect(row).toBeTruthy();
    });
  });

  describe('compute tables', () => {
    const expectedTables = [
      'platform_function_definitions',
      'platform_function_invocations',
      'platform_function_execution_logs',
      'platform_secret_definitions',
      'platform_compute_log',
      'platform_compute_log_default',
      'platform_usage_daily',
      'org_function_invocations',
      'org_function_execution_logs',
    ];

    it.each(expectedTables)('table %s exists in constructive_compute_public', async (table) => {
      const row = await pg.oneOrNone(
        `SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'constructive_compute_public' AND table_name = $1`,
        [table]
      );
      expect(row).toBeTruthy();
    });
  });

  describe('compute functions', () => {
    it('rollup_compute_daily exists in constructive_compute_private', async () => {
      const row = await pg.oneOrNone(
        `SELECT proname FROM pg_proc p
         JOIN pg_namespace n ON p.pronamespace = n.oid
         WHERE n.nspname = 'constructive_compute_private'
           AND p.proname = 'rollup_compute_daily'`
      );
      expect(row).toBeTruthy();
    });
  });

  describe('metaschema registrations', () => {
    it('function_module is registered', async () => {
      const rows = await pg.any(
        `SELECT scope, definitions_table_name FROM metaschema_modules_public.function_module
         WHERE database_id = '00000000-0000-0000-0000-000000000000'`
      );
      expect(rows.length).toBeGreaterThan(0);
    });

    it('function_invocation_module is registered for platform + org scopes', async () => {
      const rows = await pg.any(
        `SELECT scope FROM metaschema_modules_public.function_invocation_module
         WHERE database_id = '00000000-0000-0000-0000-000000000000'
         ORDER BY scope`
      );
      const scopes = rows.map((r: Record<string, unknown>) => r.scope);
      expect(scopes).toContain('platform');
      expect(scopes).toContain('org');
    });

    it('compute_log_module is registered for platform scope', async () => {
      const row = await pg.oneOrNone<{
        scope: string;
        compute_log_table_name: string;
        usage_daily_table_name: string;
      }>(
        `SELECT scope, compute_log_table_name, usage_daily_table_name
         FROM metaschema_modules_public.compute_log_module
         WHERE database_id = '00000000-0000-0000-0000-000000000000'
           AND scope = 'platform'`
      );
      expect(row).toBeTruthy();
      expect(row!.compute_log_table_name).toBe('platform_compute_log');
      expect(row!.usage_daily_table_name).toBe('platform_usage_daily');
    });
  });

  describe('function definitions', () => {
    it('has 4 invocable functions seeded', async () => {
      const rows = await pg.any(
        `SELECT name, task_identifier, is_invocable
         FROM constructive_compute_public.platform_function_definitions
         WHERE is_invocable = true
         ORDER BY name`
      );
      expect(rows.length).toBe(4);
      const names = rows.map((r: Record<string, unknown>) => r.name);
      expect(names).toEqual(
        expect.arrayContaining(['node-example', 'python-example', 'send-email', 'send-verification-link'])
      );
    });
  });

  describe('API routing', () => {
    it('compute API is configured with constructive_compute_public schema', async () => {
      const row = await pg.oneOrNone(
        `SELECT a.name FROM services_public.apis a
         JOIN services_public.api_schemas aps ON aps.api_id = a.id
         JOIN metaschema_public.schema s ON s.id = aps.schema_id
         WHERE a.database_id = '00000000-0000-0000-0000-000000000000'
           AND a.name = 'compute'
           AND s.schema_name = 'constructive_compute_public'`
      );
      expect(row).toBeTruthy();
    });
  });

  describe('partitioning', () => {
    it('platform_compute_log is partitioned by RANGE', async () => {
      const row = await pg.oneOrNone<{ partition_strategy: string }>(
        `SELECT p.partstrat AS partition_strategy
         FROM pg_partitioned_table p
         JOIN pg_class c ON c.oid = p.partrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'constructive_compute_public'
           AND c.relname = 'platform_compute_log'`
      );
      expect(row).toBeTruthy();
      expect(row!.partition_strategy).toBe('r'); // 'r' = range
    });

    it('platform_compute_log_default partition exists', async () => {
      const row = await pg.oneOrNone(
        `SELECT 1 FROM pg_inherits i
         JOIN pg_class child ON child.oid = i.inhrelid
         JOIN pg_namespace n ON n.oid = child.relnamespace
         WHERE n.nspname = 'constructive_compute_public'
           AND child.relname = 'platform_compute_log_default'`
      );
      expect(row).toBeTruthy();
    });
  });

  describe('indexes', () => {
    it('platform_usage_daily has unique constraint for upsert', async () => {
      const row = await pg.oneOrNone(
        `SELECT 1 FROM pg_indexes
         WHERE schemaname = 'constructive_compute_public'
           AND tablename = 'platform_usage_daily'
           AND indexname LIKE '%entity_task_date%'`
      );
      expect(row).toBeTruthy();
    });
  });
});
