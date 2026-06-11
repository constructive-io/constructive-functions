-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/invocation_id/alterations/alt0000002655
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/invocation_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.invocation_id IS E'Parent function_invocations row (for metering)';

