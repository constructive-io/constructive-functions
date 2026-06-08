-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/created_at/alterations/alt0000000055


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN created_at DROP DEFAULT;


