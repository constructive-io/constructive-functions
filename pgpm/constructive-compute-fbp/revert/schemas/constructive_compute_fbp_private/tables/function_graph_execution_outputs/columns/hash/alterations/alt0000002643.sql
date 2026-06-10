-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/hash/alterations/alt0000002643


ALTER TABLE "constructive_compute_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN hash DROP NOT NULL;


