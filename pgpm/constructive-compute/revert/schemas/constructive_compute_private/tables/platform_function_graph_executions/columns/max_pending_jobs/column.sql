-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_pending_jobs/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP COLUMN max_pending_jobs RESTRICT;


