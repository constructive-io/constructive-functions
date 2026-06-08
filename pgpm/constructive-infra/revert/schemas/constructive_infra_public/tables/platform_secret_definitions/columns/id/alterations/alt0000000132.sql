-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/id/alterations/alt0000000132


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN id DROP NOT NULL;


