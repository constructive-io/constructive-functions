-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/timeout_at/alterations/alt0000002705


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN timeout_at DROP DEFAULT;


