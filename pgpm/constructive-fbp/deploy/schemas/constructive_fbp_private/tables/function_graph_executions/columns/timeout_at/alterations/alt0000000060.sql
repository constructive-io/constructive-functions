-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/timeout_at/alterations/alt0000000060
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/timeout_at/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.timeout_at IS E'Absolute deadline — execution fails if still running after this time';

