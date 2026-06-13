-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/created_at/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN created_at RESTRICT;


