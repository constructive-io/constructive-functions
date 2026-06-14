-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/definitions_commit_id/alterations/alt0000002679
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/definitions_commit_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.definitions_commit_id IS 'Pinned definitions store commit for deterministic evaluation';

