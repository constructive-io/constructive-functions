-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/updated_at/alterations/alt0000000152


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN updated_at DROP DEFAULT;
