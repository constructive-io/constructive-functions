-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/name/alterations/alt0000002087


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN name DROP NOT NULL;


