-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema


CREATE TABLE "constructive_compute_public".platform_function_graph_executions (
  started_at timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (started_at);

