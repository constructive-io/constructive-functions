-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/alterations/alt0000002680
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.status IS E'Lifecycle: pending → running → completed/failed/cancelled';

