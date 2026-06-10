-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/name/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN name RESTRICT;


