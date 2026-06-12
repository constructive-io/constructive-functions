-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/inputs/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN inputs RESTRICT;


