-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000000053
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.status IS E'Lifecycle: pending → running → completed/failed/cancelled';

