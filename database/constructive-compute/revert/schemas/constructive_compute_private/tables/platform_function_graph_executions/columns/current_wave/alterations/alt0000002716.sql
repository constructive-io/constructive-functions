-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/current_wave/alterations/alt0000002716


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN current_wave DROP DEFAULT;


