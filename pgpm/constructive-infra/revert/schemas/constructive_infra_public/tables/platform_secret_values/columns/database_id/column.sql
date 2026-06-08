-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  DROP COLUMN database_id RESTRICT;
