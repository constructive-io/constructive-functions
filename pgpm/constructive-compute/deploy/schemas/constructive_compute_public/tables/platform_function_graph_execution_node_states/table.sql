-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_node_states/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


CREATE TABLE "constructive_compute_public".platform_function_graph_execution_node_states (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

