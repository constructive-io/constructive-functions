-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/id/alterations/alt0000002698
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/id/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_node_states 
  ALTER COLUMN id SET NOT NULL;

