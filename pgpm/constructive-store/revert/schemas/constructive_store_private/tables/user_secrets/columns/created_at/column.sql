-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/created_at/column


ALTER TABLE "constructive_store_private".user_secrets 
  DROP COLUMN created_at RESTRICT;


