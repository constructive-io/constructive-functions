-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/created_at/alterations/alt0000000151


ALTER TABLE "constructive_infra_public".platform_secret_values
  ALTER COLUMN created_at DROP DEFAULT;
