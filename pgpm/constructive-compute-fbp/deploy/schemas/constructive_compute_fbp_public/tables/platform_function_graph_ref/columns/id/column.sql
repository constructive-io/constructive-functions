-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/table


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ADD COLUMN id uuid;

