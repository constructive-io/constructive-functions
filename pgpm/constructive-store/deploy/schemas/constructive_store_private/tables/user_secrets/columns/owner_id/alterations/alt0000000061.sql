-- Deploy: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/alterations/alt0000000061
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table
-- requires: schemas/constructive_store_private/tables/user_secrets/columns/owner_id/column


ALTER TABLE "constructive_store_private".user_secrets 
  ALTER COLUMN owner_id SET NOT NULL;

