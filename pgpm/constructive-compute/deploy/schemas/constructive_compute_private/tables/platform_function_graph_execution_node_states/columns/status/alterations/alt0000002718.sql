-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/status/alterations/alt0000002718
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/status/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ADD CONSTRAINT platform_function_graph_execution_node_states_status_chk 
    CHECK (status IN ( 'pending', 'queued', 'running', 'completed', 'failed' ));

