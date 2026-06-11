-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/alterations/alt0000002687
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN max_pending_jobs SET NOT NULL;

