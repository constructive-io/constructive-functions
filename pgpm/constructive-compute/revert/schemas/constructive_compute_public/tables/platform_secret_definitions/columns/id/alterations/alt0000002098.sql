-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/id/alterations/alt0000002098


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN id DROP DEFAULT;


