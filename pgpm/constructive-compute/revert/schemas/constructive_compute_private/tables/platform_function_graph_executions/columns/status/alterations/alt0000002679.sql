-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/alterations/alt0000002679


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN status DROP DEFAULT;


