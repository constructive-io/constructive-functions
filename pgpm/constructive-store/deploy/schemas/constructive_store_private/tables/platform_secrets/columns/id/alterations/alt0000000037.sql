-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/id/alterations/alt0000000037
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN id SET NOT NULL;

