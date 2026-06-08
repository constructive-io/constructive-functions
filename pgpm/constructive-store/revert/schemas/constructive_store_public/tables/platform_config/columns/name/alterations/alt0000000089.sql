-- Revert: schemas/constructive_store_public/tables/platform_config/columns/name/alterations/alt0000000089


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN name DROP NOT NULL;


