-- Deploy: schemas/constructive_store_private/tables/user_state/alterations/alt0000001600
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_state/table


ALTER TABLE "constructive_store_private".user_state 
  DISABLE ROW LEVEL SECURITY;

