-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/id/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  DROP COLUMN id RESTRICT;
