-- Revert: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/alterations/alt0000000006


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN database_id DROP NOT NULL;


