-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/updated_at/alterations/alt0000000093
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/updated_at/column


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN updated_at SET DEFAULT now();

