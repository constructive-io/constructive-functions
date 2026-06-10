-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/store_id/alterations/alt0000002605
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/store_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ALTER COLUMN store_id SET NOT NULL;

