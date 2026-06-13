-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/indexes/idx_platform_function_graph_execution_node_states_exec_node
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/execution_id/column
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/node_name/column


CREATE INDEX idx_platform_function_graph_execution_node_states_exec_node ON "constructive_compute_private".platform_function_graph_execution_node_states ( execution_id, node_name );

