-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ADD COLUMN id uuid;

