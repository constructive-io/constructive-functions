-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/tick_count/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN tick_count RESTRICT;


