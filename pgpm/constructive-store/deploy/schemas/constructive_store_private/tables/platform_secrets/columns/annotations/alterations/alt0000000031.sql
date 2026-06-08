-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/annotations/alterations/alt0000000031
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/annotations/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;

