-- Deploy: schemas/constructive_store_private/tables/org_secrets/alterations/alt0000002020
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


ALTER TABLE "constructive_store_private".org_secrets 
  DISABLE ROW LEVEL SECURITY;

