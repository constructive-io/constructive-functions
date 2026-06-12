-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/props/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN props RESTRICT;


