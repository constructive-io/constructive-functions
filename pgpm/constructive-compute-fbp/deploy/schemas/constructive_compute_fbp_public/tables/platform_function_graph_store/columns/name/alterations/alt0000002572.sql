-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/name/alterations/alt0000002572
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/name/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  ALTER COLUMN name SET NOT NULL;

