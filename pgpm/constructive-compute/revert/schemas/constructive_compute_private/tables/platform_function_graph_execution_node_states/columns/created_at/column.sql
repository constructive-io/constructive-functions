-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/created_at/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  DROP COLUMN created_at RESTRICT;
