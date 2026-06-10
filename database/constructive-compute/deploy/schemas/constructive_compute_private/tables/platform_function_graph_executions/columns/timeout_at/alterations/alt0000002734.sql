-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/timeout_at/alterations/alt0000002734
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/timeout_at/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.timeout_at IS E'Absolute deadline — execution fails if still running after this time';

