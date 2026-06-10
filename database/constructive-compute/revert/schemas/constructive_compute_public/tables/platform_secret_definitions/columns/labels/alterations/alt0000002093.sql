-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/labels/alterations/alt0000002093


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN labels DROP NOT NULL;


