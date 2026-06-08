-- Deploy: schemas/constructive_store_private/tables/user_state/columns/name/alterations/alt0000000070
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table
-- requires: schemas/constructive_store_private/tables/user_state/columns/name/column


ALTER TABLE "constructive_store_private".user_state 
  ALTER COLUMN name SET NOT NULL;

