-- Revert: schemas/constructive_compute_public/tables/platform_secret_definitions/columns/updated_at/alterations/alt0000002086


ALTER TABLE "constructive_compute_public".platform_secret_definitions 
  ALTER COLUMN updated_at DROP DEFAULT;


