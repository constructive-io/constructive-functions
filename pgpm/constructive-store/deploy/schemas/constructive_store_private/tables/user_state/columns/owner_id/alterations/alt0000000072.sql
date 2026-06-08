-- Deploy: schemas/constructive_store_private/tables/user_state/columns/owner_id/alterations/alt0000000072
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table
-- requires: schemas/constructive_store_private/tables/user_state/columns/owner_id/column


ALTER TABLE "constructive_store_private".user_state 
  ALTER COLUMN owner_id SET NOT NULL;

