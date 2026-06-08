-- Revert: schemas/constructive_store_public/tables/platform_config/columns/id/alterations/alt0000000083


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN id DROP NOT NULL;


