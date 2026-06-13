-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/execution_id/alterations/alt0000002703
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/execution_id/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ALTER COLUMN execution_id SET NOT NULL;

