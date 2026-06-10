-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/annotations/alterations/alt0000002018
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/annotations/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN annotations SET DEFAULT '{}'::jsonb;

