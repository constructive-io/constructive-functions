-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/id/alterations/alt0000000037


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN id DROP NOT NULL;


