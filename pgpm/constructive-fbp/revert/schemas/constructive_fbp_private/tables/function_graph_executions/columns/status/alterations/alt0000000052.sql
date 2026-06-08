-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000000052


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN status DROP DEFAULT;


