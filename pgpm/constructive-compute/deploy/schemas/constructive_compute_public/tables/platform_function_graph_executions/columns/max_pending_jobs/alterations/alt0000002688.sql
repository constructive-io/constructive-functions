-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_pending_jobs/alterations/alt0000002688
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_pending_jobs/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN max_pending_jobs SET NOT NULL;

