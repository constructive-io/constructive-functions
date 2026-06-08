-- Revert: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/data/alterations/alt0000000004


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN data DROP NOT NULL;


