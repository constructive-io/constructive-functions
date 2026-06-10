-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema


CREATE TABLE "constructive_compute_fbp_private".function_graph_execution_outputs (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

