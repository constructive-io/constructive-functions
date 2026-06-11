-- Deploy: schemas/constructive_store_private/tables/platform_secrets/alterations/alt0000001955
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


ALTER TABLE "constructive_store_private".platform_secrets 
  DISABLE ROW LEVEL SECURITY;

