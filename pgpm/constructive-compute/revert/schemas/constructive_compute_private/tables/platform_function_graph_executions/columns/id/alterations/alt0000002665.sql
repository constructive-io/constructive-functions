-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/id/alterations/alt0000002665


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN id DROP DEFAULT;


