-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/parent_execution_id/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN parent_execution_id RESTRICT;


