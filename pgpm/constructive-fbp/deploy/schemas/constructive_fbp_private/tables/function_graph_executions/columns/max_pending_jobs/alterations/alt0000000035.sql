-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/alterations/alt0000000035
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_pending_jobs/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.max_pending_jobs IS E'Maximum pending jobs before execution is failed (default 50)';

