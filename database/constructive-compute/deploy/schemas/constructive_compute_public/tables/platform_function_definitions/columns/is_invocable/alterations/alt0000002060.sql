-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_invocable/alterations/alt0000002060
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_invocable/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN is_invocable SET DEFAULT false;

