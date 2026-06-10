-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/annotations/alterations/alt0000002096


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN annotations DROP NOT NULL;


