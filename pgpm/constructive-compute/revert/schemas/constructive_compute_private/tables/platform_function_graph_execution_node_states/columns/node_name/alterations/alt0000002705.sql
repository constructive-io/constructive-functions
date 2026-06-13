-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/node_name/alterations/alt0000002705


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  ALTER COLUMN node_name DROP NOT NULL;
