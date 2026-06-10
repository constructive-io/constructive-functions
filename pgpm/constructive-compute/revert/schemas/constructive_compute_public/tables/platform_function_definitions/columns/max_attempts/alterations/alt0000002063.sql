-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/max_attempts/alterations/alt0000002063


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN max_attempts DROP DEFAULT;


