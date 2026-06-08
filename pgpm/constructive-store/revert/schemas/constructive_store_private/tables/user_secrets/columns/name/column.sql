-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/name/column


ALTER TABLE "constructive_store_private".user_secrets 
  DROP COLUMN name RESTRICT;


