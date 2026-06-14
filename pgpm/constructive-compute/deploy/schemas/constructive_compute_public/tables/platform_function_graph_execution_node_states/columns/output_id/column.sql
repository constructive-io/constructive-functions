-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/columns/output_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/table


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_node_states 
  ADD COLUMN output_id uuid;

