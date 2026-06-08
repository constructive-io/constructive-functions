-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/value/column


ALTER TABLE "constructive_store_private".user_secrets 
  DROP COLUMN value RESTRICT;


