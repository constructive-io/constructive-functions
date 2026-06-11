-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/max_attempts/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN max_attempts RESTRICT;


