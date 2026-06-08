-- Deploy: schemas/constructive_store_private/tables/platform_secrets/columns/labels/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table


ALTER TABLE "constructive_store_private".platform_secrets 
  ADD COLUMN labels jsonb;

