-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/priority/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN priority RESTRICT;


