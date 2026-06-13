-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/id/alterations/alt0000002699


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states
  ALTER COLUMN id DROP DEFAULT;
