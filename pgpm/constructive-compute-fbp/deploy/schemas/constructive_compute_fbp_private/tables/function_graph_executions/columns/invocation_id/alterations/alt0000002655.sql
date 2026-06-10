-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/invocation_id/alterations/alt0000002655
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/invocation_id/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.invocation_id IS E'Parent function_invocations row (for metering)';

