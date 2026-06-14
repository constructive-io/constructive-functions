-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/execution_id/alterations/alt0000002703


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  ALTER COLUMN execution_id DROP NOT NULL;


