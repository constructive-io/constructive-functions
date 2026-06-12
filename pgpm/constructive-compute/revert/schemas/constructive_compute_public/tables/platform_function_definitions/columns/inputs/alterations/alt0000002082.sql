-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/inputs/alterations/alt0000002082


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN inputs DROP DEFAULT;


