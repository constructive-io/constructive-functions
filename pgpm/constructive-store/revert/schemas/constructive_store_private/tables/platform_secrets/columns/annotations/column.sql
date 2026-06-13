-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/annotations/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN annotations RESTRICT;


