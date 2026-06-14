-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/node_name/alterations/alt0000002707
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/node_name/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  ALTER COLUMN node_name SET NOT NULL;

