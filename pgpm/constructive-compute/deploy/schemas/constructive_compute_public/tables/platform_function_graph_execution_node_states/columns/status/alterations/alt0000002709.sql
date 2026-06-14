-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/status/alterations/alt0000002709
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/status/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  ALTER COLUMN status SET NOT NULL;

