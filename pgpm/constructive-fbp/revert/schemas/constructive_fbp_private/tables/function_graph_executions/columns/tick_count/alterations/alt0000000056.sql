-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/tick_count/alterations/alt0000000056


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN tick_count DROP DEFAULT;


