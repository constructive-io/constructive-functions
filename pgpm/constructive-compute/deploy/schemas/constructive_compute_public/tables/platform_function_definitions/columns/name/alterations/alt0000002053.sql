-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/alterations/alt0000002053
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN name SET NOT NULL;

