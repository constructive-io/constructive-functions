-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/columns/graph_execution_id/alterations/alt0000002205
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/columns/graph_execution_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_invocations.graph_execution_id IS 'Groups all node invocations from a single flow graph execution';

