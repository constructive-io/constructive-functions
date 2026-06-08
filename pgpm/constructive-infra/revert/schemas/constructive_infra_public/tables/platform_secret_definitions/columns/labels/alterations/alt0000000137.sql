-- Revert: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/labels/alterations/alt0000000137


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN labels DROP NOT NULL;


