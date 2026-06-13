-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/annotations/alterations/alt0000002017


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN annotations DROP NOT NULL;


