-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/namespace_id/alterations/alt0000001965


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN namespace_id DROP NOT NULL;


