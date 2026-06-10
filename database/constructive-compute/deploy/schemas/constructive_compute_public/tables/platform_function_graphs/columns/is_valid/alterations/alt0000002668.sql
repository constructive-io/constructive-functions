-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/is_valid/alterations/alt0000002668
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/is_valid/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN is_valid SET DEFAULT false;

