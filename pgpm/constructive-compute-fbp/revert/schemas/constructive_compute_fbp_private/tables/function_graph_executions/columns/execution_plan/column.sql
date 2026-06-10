-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/execution_plan/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN execution_plan RESTRICT;


