-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_pending_jobs/alterations/alt0000002703
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_pending_jobs/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.max_pending_jobs IS E'Maximum pending jobs before execution is failed (default 50)';

