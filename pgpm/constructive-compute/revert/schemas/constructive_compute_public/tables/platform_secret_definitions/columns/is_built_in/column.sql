-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/is_built_in/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  DROP COLUMN is_built_in RESTRICT;


