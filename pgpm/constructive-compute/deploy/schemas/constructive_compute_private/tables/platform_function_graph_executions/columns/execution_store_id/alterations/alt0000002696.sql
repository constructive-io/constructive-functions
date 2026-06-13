-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/execution_store_id/alterations/alt0000002696
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/execution_store_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.execution_store_id IS E'FK to execution_tree_store — links execution to its Merkle tree for time-travel debugging';

