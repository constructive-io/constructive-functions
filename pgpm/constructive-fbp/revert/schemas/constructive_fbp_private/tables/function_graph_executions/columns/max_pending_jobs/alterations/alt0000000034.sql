-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/alterations/alt0000000034


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN max_pending_jobs DROP DEFAULT;


