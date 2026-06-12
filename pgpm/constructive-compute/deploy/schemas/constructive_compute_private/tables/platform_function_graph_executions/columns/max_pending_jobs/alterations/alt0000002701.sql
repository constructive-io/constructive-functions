-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_pending_jobs/alterations/alt0000002701
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_pending_jobs/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN max_pending_jobs SET NOT NULL;

