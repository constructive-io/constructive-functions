-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/max_attempts/alterations/alt0000002063
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/max_attempts/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN max_attempts SET DEFAULT 25;

