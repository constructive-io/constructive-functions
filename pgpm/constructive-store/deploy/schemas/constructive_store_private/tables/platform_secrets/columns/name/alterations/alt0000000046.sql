-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/name/alterations/alt0000000046
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/name/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN name SET NOT NULL;

