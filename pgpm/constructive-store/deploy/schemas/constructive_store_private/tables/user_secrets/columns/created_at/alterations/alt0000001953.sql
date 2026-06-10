-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/created_at/alterations/alt0000001953
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/created_at/column


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN created_at SET DEFAULT now();

