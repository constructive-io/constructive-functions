-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/status/alterations/alt0000002710


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ALTER COLUMN status DROP DEFAULT;


