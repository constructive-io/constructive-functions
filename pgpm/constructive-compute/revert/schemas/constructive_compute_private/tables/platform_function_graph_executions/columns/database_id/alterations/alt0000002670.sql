-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/database_id/alterations/alt0000002670


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN database_id DROP NOT NULL;


