-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/parent_node_name/alterations/alt0000002677
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/parent_node_name/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.parent_node_name IS E'Node name in parent execution that spawned this sub-execution';

