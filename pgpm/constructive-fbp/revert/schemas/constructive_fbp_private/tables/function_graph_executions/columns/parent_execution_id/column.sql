-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/parent_execution_id/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP COLUMN parent_execution_id RESTRICT;


