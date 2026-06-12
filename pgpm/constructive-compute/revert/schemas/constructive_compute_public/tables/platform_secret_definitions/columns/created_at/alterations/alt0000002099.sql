-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/created_at/alterations/alt0000002099


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN created_at DROP DEFAULT;


