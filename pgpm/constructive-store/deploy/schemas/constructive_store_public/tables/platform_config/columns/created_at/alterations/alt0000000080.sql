-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/created_at/alterations/alt0000000080
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/created_at/column


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN created_at SET DEFAULT now();

