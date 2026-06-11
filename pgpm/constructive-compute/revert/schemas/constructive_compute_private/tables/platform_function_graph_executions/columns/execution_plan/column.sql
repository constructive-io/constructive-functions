-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/execution_plan/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN execution_plan RESTRICT;


