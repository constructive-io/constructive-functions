-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/id/alterations/alt0000000146


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN id DROP DEFAULT;
