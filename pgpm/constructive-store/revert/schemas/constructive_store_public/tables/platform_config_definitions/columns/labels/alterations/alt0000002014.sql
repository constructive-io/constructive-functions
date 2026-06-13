-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/labels/alterations/alt0000002014


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN labels DROP NOT NULL;


