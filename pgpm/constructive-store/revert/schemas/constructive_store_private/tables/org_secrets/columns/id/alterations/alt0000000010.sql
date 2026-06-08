-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/id/alterations/alt0000000010


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN id DROP NOT NULL;


