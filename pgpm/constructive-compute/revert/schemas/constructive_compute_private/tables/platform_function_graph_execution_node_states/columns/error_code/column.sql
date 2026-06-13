-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/error_code/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  DROP COLUMN error_code RESTRICT;


