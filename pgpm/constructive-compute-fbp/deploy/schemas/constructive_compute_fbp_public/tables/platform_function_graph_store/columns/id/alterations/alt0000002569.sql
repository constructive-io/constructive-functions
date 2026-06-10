-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/id/alterations/alt0000002569
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  ALTER COLUMN id SET NOT NULL;

