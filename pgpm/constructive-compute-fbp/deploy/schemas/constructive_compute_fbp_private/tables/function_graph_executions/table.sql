-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema


CREATE TABLE "constructive_compute_fbp_private".function_graph_executions (
  started_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (started_at);

