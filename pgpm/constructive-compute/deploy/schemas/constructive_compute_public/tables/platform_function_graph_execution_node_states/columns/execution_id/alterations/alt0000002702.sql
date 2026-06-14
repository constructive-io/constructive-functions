-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/execution_id/alterations/alt0000002702
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/execution_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_execution_node_states.execution_id IS 'FK to the parent graph execution';

