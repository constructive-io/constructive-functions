-- Deploy: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/alterations/alt0000002621
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graphs/columns/name/column


ALTER TABLE "constructive_compute_public".platform_function_graphs 
  ALTER COLUMN name SET NOT NULL;

