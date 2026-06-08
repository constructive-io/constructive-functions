-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/updated_at/alterations/alt0000000050
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/updated_at/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN updated_at SET DEFAULT now();

