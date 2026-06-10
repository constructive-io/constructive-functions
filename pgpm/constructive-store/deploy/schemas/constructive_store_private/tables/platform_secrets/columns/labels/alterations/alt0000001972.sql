-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/labels/alterations/alt0000001972
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/labels/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

