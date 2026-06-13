-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/node_name/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  DROP COLUMN node_name RESTRICT;


