-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/database_id/alterations/alt0000002099


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN database_id DROP NOT NULL;


