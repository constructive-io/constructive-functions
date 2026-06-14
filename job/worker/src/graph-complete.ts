/**
 * Graph execution completion helpers.
 *
 * After the worker executes a node (inline or cloud), these functions
 * call the corresponding SQL procedures to store outputs and advance
 * the execution graph to the next tick.
 *
 * This is the shared completion path for BOTH inline (FBP native) and
 * cloud function invocations — the graph engine sees no difference.
 */
import type { Pool } from 'pg';

/**
 * Mark a graph node as completed with its output data.
 * Calls `constructive_compute_private.platform_complete_node` which:
 *   1. Stores the output in execution_outputs (content-addressed)
 *   2. Updates node_outputs on the execution
 *   3. Sets node_state to 'completed'
 *   4. Calls tick_execution to advance the graph
 */
export const completeNode = async (
  pool: Pool,
  executionId: string,
  nodeName: string,
  outputData: Record<string, any>
): Promise<void> => {
  await pool.query(
    `SELECT "constructive_compute_private".platform_complete_node($1::uuid, $2::text, $3::jsonb)`,
    [executionId, nodeName, JSON.stringify(outputData)]
  );
};

/**
 * Mark a graph node as failed with an error message.
 * Calls `constructive_compute_private.platform_fail_node` which:
 *   1. Sets node_state to 'failed'
 *   2. Stores the error message
 *   3. Optionally fails the parent execution
 */
export const failNode = async (
  pool: Pool,
  executionId: string,
  nodeName: string,
  errorMessage: string
): Promise<void> => {
  await pool.query(
    `SELECT "constructive_compute_private".platform_fail_node($1::uuid, $2::text, $3::text)`,
    [executionId, nodeName, errorMessage]
  );
};
