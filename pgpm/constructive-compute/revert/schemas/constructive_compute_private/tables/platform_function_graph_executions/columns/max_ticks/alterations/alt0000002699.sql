-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/alterations/alt0000002699


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN max_ticks DROP DEFAULT;


