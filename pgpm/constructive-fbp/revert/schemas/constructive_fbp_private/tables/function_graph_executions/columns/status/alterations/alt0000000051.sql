-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000000051


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN status DROP NOT NULL;


