-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/annotations/alterations/alt0000000125


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN annotations DROP NOT NULL;


