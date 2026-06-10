-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/parent_node_name/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN parent_node_name RESTRICT;


