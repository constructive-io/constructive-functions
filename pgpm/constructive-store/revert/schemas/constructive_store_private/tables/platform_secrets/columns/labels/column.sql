-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/labels/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN labels RESTRICT;


