-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/output_id/alterations/alt0000002716
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/output_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_execution_node_states.output_id IS E'FK to execution_outputs — content-addressed output blob for this node';

