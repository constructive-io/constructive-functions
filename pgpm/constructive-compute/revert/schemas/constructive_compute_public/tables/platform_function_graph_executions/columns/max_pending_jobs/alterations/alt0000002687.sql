-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_pending_jobs/alterations/alt0000002687


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN max_pending_jobs DROP NOT NULL;


