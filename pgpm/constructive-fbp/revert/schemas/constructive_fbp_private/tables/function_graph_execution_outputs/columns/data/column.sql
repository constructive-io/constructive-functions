-- Revert: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/data/column


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  DROP COLUMN data RESTRICT;


