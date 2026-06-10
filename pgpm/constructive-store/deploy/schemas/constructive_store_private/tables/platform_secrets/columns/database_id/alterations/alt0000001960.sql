-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/alterations/alt0000001960
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN database_id SET NOT NULL;

