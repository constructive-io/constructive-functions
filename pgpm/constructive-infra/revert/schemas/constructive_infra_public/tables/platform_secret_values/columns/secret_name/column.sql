-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/secret_name/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  DROP COLUMN secret_name RESTRICT;
