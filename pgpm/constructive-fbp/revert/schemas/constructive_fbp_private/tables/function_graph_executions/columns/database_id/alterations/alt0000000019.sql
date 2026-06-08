-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/database_id/alterations/alt0000000019


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN database_id DROP NOT NULL;


