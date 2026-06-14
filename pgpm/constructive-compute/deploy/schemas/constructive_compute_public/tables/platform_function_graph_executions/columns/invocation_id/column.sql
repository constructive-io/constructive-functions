-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/invocation_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ADD COLUMN invocation_id uuid;

