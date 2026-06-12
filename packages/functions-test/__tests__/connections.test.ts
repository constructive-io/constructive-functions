/**
 * Self-tests for @constructive-io/functions-test.
 *
 * Requires PostgreSQL running locally with pgpm roles bootstrapped.
 * These tests deploy actual pgpm modules into isolated test databases.
 *
 * Run: pnpm --filter @constructive-io/functions-test test
 */

import { getConnections } from '../src';
import type { FunctionsTestResult } from '../src';

jest.setTimeout(120_000);

describe('getConnections', () => {
  let result: FunctionsTestResult;

  beforeAll(async () => {
    result = await getConnections({ modules: 'all' });
  });

  afterAll(async () => {
    if (result?.teardown) {
      await result.teardown();
    }
  });

  beforeEach(async () => {
    await result.pg.beforeEach();
    await result.db.beforeEach();
  });

  afterEach(async () => {
    await result.db.afterEach();
    await result.pg.afterEach();
  });

  test('creates pg and db clients', () => {
    expect(result.pg).toBeDefined();
    expect(result.db).toBeDefined();
    expect(result.teardown).toBeInstanceOf(Function);
  });

  test('pg client can query information_schema', async () => {
    const row = await result.pg.one<{ count: string }>(
      `SELECT count(*)::text as count FROM information_schema.schemata`
    );
    expect(parseInt(row.count, 10)).toBeGreaterThan(0);
  });

  test('constructive_compute_public schema exists', async () => {
    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM information_schema.schemata
       WHERE schema_name = 'constructive_compute_public'`
    );
    expect(row).toBeTruthy();
  });

  test('platform_function_definitions table exists', async () => {
    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'constructive_compute_public'
         AND table_name = 'platform_function_definitions'`
    );
    expect(row).toBeTruthy();
  });

  test('platform_compute_log table exists', async () => {
    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'constructive_compute_public'
         AND table_name = 'platform_compute_log'`
    );
    expect(row).toBeTruthy();
  });

  test('platform_usage_daily table exists', async () => {
    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'constructive_compute_public'
         AND table_name = 'platform_usage_daily'`
    );
    expect(row).toBeTruthy();
  });

  test('app_jobs schema exists', async () => {
    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM information_schema.schemata
       WHERE schema_name = 'app_jobs'`
    );
    expect(row).toBeTruthy();
  });

  test('savepoint isolation — inserts are rolled back', async () => {
    await result.pg.query(
      `INSERT INTO constructive_compute_public.platform_function_definitions
       (name, task_identifier, scope)
       VALUES ('test-fn', 'test-fn', 'platform')`
    );

    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM constructive_compute_public.platform_function_definitions
       WHERE name = 'test-fn'`
    );
    expect(row).toBeTruthy();
  });

  test('previous test insert was rolled back', async () => {
    const row = await result.pg.oneOrNone(
      `SELECT 1 FROM constructive_compute_public.platform_function_definitions
       WHERE name = 'test-fn'`
    );
    expect(row).toBeNull();
  });
});
