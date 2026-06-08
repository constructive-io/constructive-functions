-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/configured_value/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  DROP COLUMN configured_value RESTRICT;
