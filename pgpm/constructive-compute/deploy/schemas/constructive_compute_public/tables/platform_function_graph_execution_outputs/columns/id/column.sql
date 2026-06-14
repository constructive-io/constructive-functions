-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_outputs 
  ADD COLUMN id uuid;

