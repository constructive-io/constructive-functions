-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/error_message/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN error_message RESTRICT;


