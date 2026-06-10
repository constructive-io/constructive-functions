-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/node_outputs/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN node_outputs RESTRICT;


