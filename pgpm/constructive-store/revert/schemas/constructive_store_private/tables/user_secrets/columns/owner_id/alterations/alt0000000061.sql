-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/alterations/alt0000000061


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN owner_id DROP NOT NULL;


