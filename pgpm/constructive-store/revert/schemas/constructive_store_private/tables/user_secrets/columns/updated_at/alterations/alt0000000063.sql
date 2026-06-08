-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/updated_at/alterations/alt0000000063


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;


