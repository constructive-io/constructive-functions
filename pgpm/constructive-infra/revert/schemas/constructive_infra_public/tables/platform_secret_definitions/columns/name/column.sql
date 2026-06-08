-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/name/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  DROP COLUMN name RESTRICT;


