-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_ticks/alterations/alt0000000036


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN max_ticks DROP NOT NULL;


