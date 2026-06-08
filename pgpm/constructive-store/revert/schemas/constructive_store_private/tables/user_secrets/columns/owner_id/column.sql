-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/column


ALTER TABLE "constructive_store_private".user_secrets 
  DROP COLUMN owner_id RESTRICT;


