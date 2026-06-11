-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/created_at/alterations/alt0000002564
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_object/columns/created_at/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_object 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

