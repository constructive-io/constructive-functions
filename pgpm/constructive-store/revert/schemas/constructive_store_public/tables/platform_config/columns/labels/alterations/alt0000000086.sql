-- Revert: schemas/constructive_store_public/tables/platform_config/columns/labels/alterations/alt0000000086


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN labels DROP NOT NULL;


