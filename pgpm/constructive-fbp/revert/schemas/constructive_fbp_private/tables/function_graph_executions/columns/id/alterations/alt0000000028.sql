-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/id/alterations/alt0000000028


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN id DROP NOT NULL;


