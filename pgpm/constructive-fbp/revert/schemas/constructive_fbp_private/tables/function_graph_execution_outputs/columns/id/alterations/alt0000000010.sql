-- Revert: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/id/alterations/alt0000000010


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN id DROP NOT NULL;


