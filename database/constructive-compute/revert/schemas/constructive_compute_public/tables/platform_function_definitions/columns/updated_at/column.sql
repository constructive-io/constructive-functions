-- Revert: schemas/constructive_compute_public/tables/platform_function_definitions/columns/updated_at/column


ALTER TABLE "constructive_compute_public".platform_function_definitions 
  DROP COLUMN updated_at RESTRICT;


