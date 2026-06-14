-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/node_path/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  DROP COLUMN node_path RESTRICT;
