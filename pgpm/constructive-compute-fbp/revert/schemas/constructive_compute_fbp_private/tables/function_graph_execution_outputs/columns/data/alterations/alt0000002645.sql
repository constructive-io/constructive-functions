-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/data/alterations/alt0000002645


ALTER TABLE "constructive_compute_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN data DROP NOT NULL;


