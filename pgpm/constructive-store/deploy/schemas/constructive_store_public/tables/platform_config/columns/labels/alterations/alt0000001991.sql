-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/labels/alterations/alt0000001991
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/labels/column


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

