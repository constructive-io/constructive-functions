-- Revert: schemas/constructive_store_private/tables/user_state/columns/name/alterations/alt0000000070


ALTER TABLE "constructive_store_private".user_state 
  ALTER COLUMN name DROP NOT NULL;


