-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/indexes/idx_platform_function_graph_execution_node_states_exec_node
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/table


CREATE INDEX idx_platform_function_graph_execution_node_states_exec_node ON "constructive_compute_public".platform_function_graph_execution_node_states ( execution_id, node_name );

