-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema


CREATE TABLE "constructive_compute_private".platform_function_graph_executions (
  started_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (started_at);

