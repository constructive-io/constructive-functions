-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/table


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ADD COLUMN created_at timestamptz;

