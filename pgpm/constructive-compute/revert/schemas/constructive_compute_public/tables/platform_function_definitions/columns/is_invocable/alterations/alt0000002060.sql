-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/is_invocable/alterations/alt0000002060


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN is_invocable DROP DEFAULT;


