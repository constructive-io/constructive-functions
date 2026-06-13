-- Deploy: schemas/constructive_compute_public/tables/platform_function_definitions/columns/runtime/alterations/alt0000002095
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_definitions/columns/runtime/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN runtime SET DEFAULT 'http';
