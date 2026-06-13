-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/status/alterations/alt0000002707
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/status/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ALTER COLUMN status SET NOT NULL;

