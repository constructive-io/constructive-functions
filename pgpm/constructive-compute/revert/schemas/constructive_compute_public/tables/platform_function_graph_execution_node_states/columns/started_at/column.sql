-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/started_at/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  DROP COLUMN started_at RESTRICT;


