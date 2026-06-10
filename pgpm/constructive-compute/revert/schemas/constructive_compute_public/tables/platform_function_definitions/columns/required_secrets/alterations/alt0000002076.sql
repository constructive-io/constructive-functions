-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/required_secrets/alterations/alt0000002076


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  ALTER COLUMN required_secrets DROP DEFAULT;


