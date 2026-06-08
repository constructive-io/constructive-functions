-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/is_built_in/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  DROP COLUMN is_built_in RESTRICT;


