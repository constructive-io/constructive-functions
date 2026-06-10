-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/table


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  ADD COLUMN name text;

