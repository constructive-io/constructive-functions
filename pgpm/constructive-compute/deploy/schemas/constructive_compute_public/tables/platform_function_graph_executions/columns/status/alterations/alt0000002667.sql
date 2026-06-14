-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/status/alterations/alt0000002667
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/status/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.status IS E'Lifecycle: pending → running → completed/failed/cancelled';

