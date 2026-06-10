-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN max_pending_jobs RESTRICT;


