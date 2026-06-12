-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/outputs/alterations/alt0000002085
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/outputs/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN outputs SET DEFAULT '[]'::jsonb;

