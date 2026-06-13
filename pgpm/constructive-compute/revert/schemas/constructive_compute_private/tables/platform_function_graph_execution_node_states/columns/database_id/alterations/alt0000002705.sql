-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/database_id/alterations/alt0000002705


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ALTER COLUMN database_id DROP NOT NULL;


