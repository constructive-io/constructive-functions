-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/database_id/alterations/alt0000002574
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_store/columns/database_id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_store 
  ALTER COLUMN database_id SET NOT NULL;

