-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_pending_jobs/alterations/alt0000002702


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN max_pending_jobs DROP DEFAULT;


