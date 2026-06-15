/**
 * Graph execution completion helpers.
 *
 * After the worker executes a node (inline or cloud), these functions
 * call the corresponding SQL procedures to store outputs and advance
 * the execution graph to the next tick.
 *
 * Schema/function names are resolved dynamically via ModuleLoader
 * (graph_execution_module) instead of hardcoding.
 */
import { ComputeModuleLoader, DEFAULT_DATABASE_ID } from '@constructive-io/module-loader';
import type { GraphExecutionModuleConfig } from '@constructive-io/module-loader';
import type { Pool } from 'pg';

let _loader: ComputeModuleLoader | null = null;
let _pool: Pool | null = null;

function getLoader(pool: Pool): ComputeModuleLoader {
  if (_loader && _pool === pool) return _loader;
  _loader = new ComputeModuleLoader(pool);
  _pool = pool;
  return _loader;
}

async function resolveGraph(pool: Pool): Promise<GraphExecutionModuleConfig> {
  const config = await getLoader(pool).load(DEFAULT_DATABASE_ID);
  return config.graphExecutionModule;
}

/**
 * Mark a graph node as completed with its output data.
 * Resolves the complete_node function from MetaSchema.
 */
export const completeNode = async (
  pool: Pool,
  executionId: string,
  nodeName: string,
  outputData: Record<string, unknown>
): Promise<void> => {
  const ge = await resolveGraph(pool);
  await pool.query(
    `SELECT "${ge.privateSchema}"."${ge.completeNodeFunction}"($1::uuid, $2::text, $3::jsonb)`,
    [executionId, nodeName, JSON.stringify(outputData)]
  );
};

/**
 * Mark a graph node as failed with an error message.
 * Resolves the fail_node function from MetaSchema.
 */
export const failNode = async (
  pool: Pool,
  executionId: string,
  nodeName: string,
  errorMessage: string
): Promise<void> => {
  const ge = await resolveGraph(pool);
  await pool.query(
    `SELECT "${ge.privateSchema}"."${ge.failNodeFunction}"($1::uuid, $2::text, $3::text)`,
    [executionId, nodeName, errorMessage]
  );
};

/** Reset loader cache (for testing). */
export function _resetGraphCompleteCache(): void {
  _loader = null;
  _pool = null;
}
