-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/error_code/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN error_code RESTRICT;


