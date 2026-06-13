-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/execution_id/alterations/alt0000002701


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  ALTER COLUMN execution_id DROP NOT NULL;
