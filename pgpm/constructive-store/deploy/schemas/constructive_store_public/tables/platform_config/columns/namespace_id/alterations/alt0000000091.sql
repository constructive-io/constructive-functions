-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/alterations/alt0000000091
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/column


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN namespace_id SET NOT NULL;

