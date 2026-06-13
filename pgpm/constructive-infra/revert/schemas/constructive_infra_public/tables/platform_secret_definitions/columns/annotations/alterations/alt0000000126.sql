-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/annotations/alterations/alt0000000126


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN annotations DROP DEFAULT;


