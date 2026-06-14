-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/created_at/alterations/alt0000002715
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_execution_node_states.created_at IS E'Timestamp of node state creation (partition key)';

