-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE TABLE "constructive_compute_private".platform_function_graph_execution_outputs (
  created_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

