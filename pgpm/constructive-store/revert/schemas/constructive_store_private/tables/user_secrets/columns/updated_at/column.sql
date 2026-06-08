-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/updated_at/column


ALTER TABLE "constructive_store_private".user_secrets 
  DROP COLUMN updated_at RESTRICT;


