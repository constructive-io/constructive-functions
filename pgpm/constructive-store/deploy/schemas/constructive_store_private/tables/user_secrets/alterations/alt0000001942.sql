-- Deploy: schemas/constructive_store_private/tables/user_secrets/alterations/alt0000001942
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/user_secrets/table


ALTER TABLE "constructive_store_private".user_secrets 
  DISABLE ROW LEVEL SECURITY;

