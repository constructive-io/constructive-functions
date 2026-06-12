-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/outputs/alterations/alt0000002085


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN outputs DROP DEFAULT;


