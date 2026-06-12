-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/props/alterations/alt0000002087
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/props/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN props SET NOT NULL;

