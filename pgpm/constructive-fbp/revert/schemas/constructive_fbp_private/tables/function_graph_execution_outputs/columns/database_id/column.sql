-- Revert: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/column


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  DROP COLUMN database_id RESTRICT;


