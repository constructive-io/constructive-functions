-- Revert: schemas/constructive_store_private/tables/user_secrets/columns/id/alterations/alt0000001944


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN id DROP NOT NULL;


