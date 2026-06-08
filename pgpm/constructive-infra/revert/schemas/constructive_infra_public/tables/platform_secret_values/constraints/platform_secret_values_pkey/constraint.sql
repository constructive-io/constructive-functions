-- Revert: schemas/constructive_infra_public/tables/platform_secret_values/constraints/platform_secret_values_pkey/constraint


ALTER TABLE "constructive_infra_public".platform_secret_values
  DROP CONSTRAINT platform_secret_values_pkey;
