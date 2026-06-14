-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/status/alterations/alt0000002709


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  ALTER COLUMN status DROP NOT NULL;


