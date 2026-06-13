-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/current_wave/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ADD COLUMN current_wave integer;

