-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/node_name/alterations/alt0000002706
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/node_name/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_execution_node_states.node_name IS E'Name of the node within the graph (e.g. send-email1)';

