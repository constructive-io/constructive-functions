-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/error_message/alterations/alt0000002715
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/error_message/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_execution_node_states.error_message IS E'Human-readable error description when status = failed';

