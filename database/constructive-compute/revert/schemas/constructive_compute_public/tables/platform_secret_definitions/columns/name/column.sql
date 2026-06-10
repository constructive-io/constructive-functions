-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/name/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  DROP COLUMN name RESTRICT;


