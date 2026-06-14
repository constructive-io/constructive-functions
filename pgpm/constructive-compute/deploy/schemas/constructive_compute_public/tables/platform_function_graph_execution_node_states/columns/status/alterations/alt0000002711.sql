-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/status/alterations/alt0000002711
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/status/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_execution_node_states.status IS E'Node lifecycle: pending → queued → running → completed/failed';

