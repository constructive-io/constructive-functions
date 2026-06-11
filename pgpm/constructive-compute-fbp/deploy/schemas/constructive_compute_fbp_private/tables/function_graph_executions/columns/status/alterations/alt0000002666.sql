-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000002666
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/status/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.status IS E'Lifecycle: pending → running → completed/failed/cancelled';

