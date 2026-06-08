-- Revert: schemas/constructive_store_private/tables/user_state/columns/owner_id/alterations/alt0000000072


ALTER TABLE "constructive_store_private".user_state 
  ALTER COLUMN owner_id DROP NOT NULL;


