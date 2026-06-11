-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/timeout_at/alterations/alt0000002690


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN timeout_at DROP NOT NULL;


