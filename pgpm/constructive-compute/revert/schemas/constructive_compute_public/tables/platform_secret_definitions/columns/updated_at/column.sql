-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/updated_at/column


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  DROP COLUMN updated_at RESTRICT;


