-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/created_at/alterations/alt0000002049


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN created_at DROP DEFAULT;


