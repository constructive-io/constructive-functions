-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/columns/updated_at/column


ALTER TABLE "constructive_infra_public".platform_secret_values
  DROP COLUMN updated_at RESTRICT;
