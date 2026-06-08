-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/invocation_id/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP COLUMN invocation_id RESTRICT;


