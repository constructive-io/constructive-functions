-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/table


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ADD COLUMN max_pending_jobs integer;

