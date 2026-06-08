-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


ALTER TABLE "constructive_store_private".user_secrets 
  ADD COLUMN owner_id uuid;

