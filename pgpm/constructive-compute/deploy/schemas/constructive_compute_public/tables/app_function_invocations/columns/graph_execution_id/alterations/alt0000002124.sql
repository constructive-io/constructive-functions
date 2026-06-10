-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/columns/graph_execution_id/alterations/alt0000002124
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/graph_execution_id/column


COMMENT ON COLUMN "constructive_compute_public".app_function_invocations.graph_execution_id IS 'Groups all node invocations from a single flow graph execution';

