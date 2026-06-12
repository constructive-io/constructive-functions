import type { PgTestClient } from 'pgsql-test/test-client';

export interface RoleClaims {
  database_id?: string;
  user_id?: string;
  entity_id?: string;
  organization_id?: string;
  entity_type?: string;
  [key: string]: string | undefined;
}

/**
 * Execute a callback as a specific PostgreSQL role with JWT claims.
 *
 * Sets `role` and `jwt.claims.*` GUCs via `setContext()` (transaction-local),
 * executes the callback, then restores the previous context.
 *
 * Must be called inside a transaction (i.e., between `beforeEach`/`afterEach`).
 *
 * @example
 * ```ts
 * test('authenticated can read compute_log', async () => {
 *   await asRole(db, 'authenticated', { database_id: dbId }, async () => {
 *     const rows = await db.any('SELECT * FROM ...');
 *     expect(rows).toHaveLength(0);
 *   });
 * });
 * ```
 */
export async function asRole(
  client: PgTestClient,
  role: string,
  claims: RoleClaims,
  fn: () => Promise<void>
): Promise<void> {
  const prevContext = client.getContext();

  const ctx: Record<string, string | null> = { role };
  for (const [key, value] of Object.entries(claims)) {
    if (value !== undefined) {
      ctx[`jwt.claims.${key}`] = value;
    }
  }
  client.setContext(ctx);

  try {
    await fn();
  } finally {
    client.setContext(prevContext);
  }
}
