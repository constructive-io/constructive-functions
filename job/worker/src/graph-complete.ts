/**
 * Graph execution completion helpers.
 *
 * After the worker executes a node (inline or cloud), these functions
 * call the corresponding SQL procedures to store outputs and advance
 * the execution graph to the next tick.
 *
 * Schema/function names are resolved dynamically via ModuleLoader.
 */

import type { GraphModuleConfig } from '@constructive-io/module-loader';
import { AmbiguousScopeError, ModuleLoader } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

let _loader: ModuleLoader | null = null;
let _pool: Pool | null = null;

function getLoader(pool: Pool): ModuleLoader {
  if (_loader && _pool === pool) return _loader;
  _loader = new ModuleLoader({ pool });
  _pool = pool;
  return _loader;
}

async function resolveGraph(pool: Pool, databaseId: string, scope?: string | null): Promise<GraphModuleConfig> {
  try {
    return await getLoader(pool).graph.load(databaseId, scope ?? null);
  } catch (err) {
    if (err instanceof AmbiguousScopeError) {
      const all = await getLoader(pool).graph.loadAll(databaseId);
      return all[0];
    }
    throw err;
  }
}

/**
 * Mark a graph node as completed with its output data.
 */
export const completeNode = async (
  pool: Pool,
  databaseId: string,
  executionId: string,
  nodeName: string,
  outputData: Record<string, unknown>,
  scope?: string | null
): Promise<void> => {
  const ge = await resolveGraph(pool, databaseId, scope);
  await pool.query(
    `SELECT "${ge.privateSchema}"."${ge.completeNodeFunction}"($1::uuid, $2::text, $3::jsonb)`,
    [executionId, nodeName, JSON.stringify(outputData)]
  );
};

/**
 * Mark a graph node as failed with an error message.
 */
export const failNode = async (
  pool: Pool,
  databaseId: string,
  executionId: string,
  nodeName: string,
  errorMessage: string,
  scope?: string | null
): Promise<void> => {
  const ge = await resolveGraph(pool, databaseId, scope);
  await pool.query(
    `SELECT "${ge.privateSchema}"."${ge.failNodeFunction}"($1::uuid, $2::text, $3::text)`,
    [executionId, nodeName, errorMessage]
  );
};
