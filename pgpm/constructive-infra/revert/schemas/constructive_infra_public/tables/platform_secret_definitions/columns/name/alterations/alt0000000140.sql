-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/name/alterations/alt0000000140


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN name DROP NOT NULL;


