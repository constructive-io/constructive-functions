-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/id/alterations/alt0000000103


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN id DROP NOT NULL;


