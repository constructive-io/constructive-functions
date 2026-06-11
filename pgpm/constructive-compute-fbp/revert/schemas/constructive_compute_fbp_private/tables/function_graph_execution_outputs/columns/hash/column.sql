-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/hash/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_execution_outputs 
  DROP COLUMN hash RESTRICT;


