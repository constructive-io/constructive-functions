-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ADD COLUMN max_ticks integer;

