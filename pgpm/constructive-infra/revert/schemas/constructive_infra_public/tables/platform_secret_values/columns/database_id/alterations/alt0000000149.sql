-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/alterations/alt0000000149


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN database_id DROP NOT NULL;
