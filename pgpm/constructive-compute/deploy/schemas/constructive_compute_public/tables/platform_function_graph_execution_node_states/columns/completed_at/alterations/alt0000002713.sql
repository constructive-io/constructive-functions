-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/completed_at/alterations/alt0000002713
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/completed_at/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_execution_node_states.completed_at IS E'Timestamp when the node finished (success or failure)';

