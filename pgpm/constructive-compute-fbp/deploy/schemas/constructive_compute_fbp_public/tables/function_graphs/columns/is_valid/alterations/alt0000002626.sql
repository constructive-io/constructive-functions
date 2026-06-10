-- Deploy: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/is_valid/alterations/alt0000002626
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_compute_fbp_public/tables/function_graphs/columns/is_valid/column


ALTER TABLE "constructive_compute_fbp_public".function_graphs 
  ALTER COLUMN is_valid SET DEFAULT false;

