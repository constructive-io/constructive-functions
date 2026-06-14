-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/execution_plan/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN execution_plan RESTRICT;


