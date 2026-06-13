-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/completed_at/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  DROP COLUMN completed_at RESTRICT;
