-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/is_built_in/alterations/alt0000000135


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN is_built_in DROP DEFAULT;


