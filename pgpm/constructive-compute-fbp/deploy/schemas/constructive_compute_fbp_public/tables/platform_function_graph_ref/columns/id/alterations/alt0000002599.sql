-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/id/alterations/alt0000002599
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/table
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_ref/columns/id/column


ALTER TABLE "constructive_compute_fbp_public".platform_function_graph_ref 
  ALTER COLUMN id SET DEFAULT uuidv7();

