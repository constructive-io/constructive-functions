-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/database_id/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN database_id RESTRICT;


