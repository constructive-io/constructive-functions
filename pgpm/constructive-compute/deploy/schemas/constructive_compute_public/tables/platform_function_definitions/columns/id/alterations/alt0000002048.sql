-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/id/alterations/alt0000002048
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();

