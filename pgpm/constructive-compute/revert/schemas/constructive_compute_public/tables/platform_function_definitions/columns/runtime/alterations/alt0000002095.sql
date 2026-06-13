-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/runtime/alterations/alt0000002095


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN runtime DROP DEFAULT;
