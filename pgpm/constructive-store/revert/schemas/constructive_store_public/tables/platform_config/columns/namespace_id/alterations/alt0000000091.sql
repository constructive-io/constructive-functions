-- Revert: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/alterations/alt0000000091


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN namespace_id DROP NOT NULL;


