-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/output_id/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  DROP COLUMN output_id RESTRICT;


