-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/current_wave/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN current_wave RESTRICT;


