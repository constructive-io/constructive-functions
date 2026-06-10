-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/definitions_commit_id/alterations/alt0000002678
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/definitions_commit_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.definitions_commit_id IS 'Pinned definitions store commit for deterministic evaluation';

