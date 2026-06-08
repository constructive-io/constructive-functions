-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN id RESTRICT;


