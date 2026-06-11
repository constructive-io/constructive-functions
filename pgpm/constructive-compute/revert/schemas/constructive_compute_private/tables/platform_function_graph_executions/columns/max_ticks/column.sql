-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN max_ticks RESTRICT;


