-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/required_configs/alterations/alt0000002078
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/required_configs/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN required_configs SET NOT NULL;

