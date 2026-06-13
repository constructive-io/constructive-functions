-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/status/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  DROP COLUMN status RESTRICT;
