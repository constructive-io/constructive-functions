-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/definitions_commit_id/alterations/alt0000002678
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/definitions_commit_id/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.definitions_commit_id IS 'Pinned definitions store commit for deterministic evaluation';

