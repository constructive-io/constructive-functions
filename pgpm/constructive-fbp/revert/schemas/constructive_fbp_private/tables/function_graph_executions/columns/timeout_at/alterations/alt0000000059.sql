-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/timeout_at/alterations/alt0000000059


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN timeout_at DROP DEFAULT;


