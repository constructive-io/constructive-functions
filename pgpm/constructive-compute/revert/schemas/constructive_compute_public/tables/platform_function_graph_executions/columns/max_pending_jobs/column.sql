-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_pending_jobs/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN max_pending_jobs RESTRICT;


