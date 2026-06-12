/**
 * Tests for role switching via asRole().
 *
 * Requires PostgreSQL running locally with pgpm roles bootstrapped.
 */

import { getConnections, asRole } from '../src';
import type { FunctionsTestResult } from '../src';

jest.setTimeout(120_000);

describe('asRole', () => {
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

  test('switches role and sets JWT claims', async () => {
    const testDbId = '00000000-0000-0000-0000-000000000001';

    await asRole(result.db, 'authenticated', { database_id: testDbId }, async () => {
      const row = await result.db.one<{ db_id: string }>(
        `SELECT current_setting('jwt.claims.database_id', true) as db_id`
      );
      expect(row.db_id).toBe(testDbId);
    });
  });

  test('restores previous context after callback', async () => {
    result.db.setContext({ role: 'authenticated' });

    await asRole(result.db, 'anonymous', {}, async () => {
      // Inside callback, role should be anonymous
    });

    const ctx = result.db.getContext();
    expect(ctx.role).toBe('authenticated');
  });

  test('restores context even on error', async () => {
    result.db.setContext({ role: 'authenticated' });

    await expect(
      asRole(result.db, 'anonymous', {}, async () => {
        throw new Error('test error');
      })
    ).rejects.toThrow('test error');

    const ctx = result.db.getContext();
    expect(ctx.role).toBe('authenticated');
  });
});
