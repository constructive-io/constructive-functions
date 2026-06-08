-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/created_at/alterations/alt0000000008
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/created_at/column


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN created_at SET DEFAULT now();

