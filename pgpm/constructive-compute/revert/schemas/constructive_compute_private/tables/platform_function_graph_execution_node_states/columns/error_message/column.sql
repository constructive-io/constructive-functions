-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/error_message/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  DROP COLUMN error_message RESTRICT;
