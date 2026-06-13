-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/updated_at/alterations/alt0000002006
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/updated_at/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN updated_at SET DEFAULT now();

