-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/data/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/table


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  ADD COLUMN data jsonb;

