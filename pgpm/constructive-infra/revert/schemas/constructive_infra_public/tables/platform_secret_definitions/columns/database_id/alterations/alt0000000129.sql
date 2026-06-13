-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/database_id/alterations/alt0000000129


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN database_id DROP NOT NULL;


