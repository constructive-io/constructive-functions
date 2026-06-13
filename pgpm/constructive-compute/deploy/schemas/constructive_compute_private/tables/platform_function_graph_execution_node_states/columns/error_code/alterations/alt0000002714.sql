-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/error_code/alterations/alt0000002714
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/error_code/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_execution_node_states.error_code IS E'Machine-readable error code when status = failed';

