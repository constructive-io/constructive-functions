-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/name/alterations/alt0000001949


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN name DROP NOT NULL;


