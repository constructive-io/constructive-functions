-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/timeout_at/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP COLUMN timeout_at RESTRICT;


