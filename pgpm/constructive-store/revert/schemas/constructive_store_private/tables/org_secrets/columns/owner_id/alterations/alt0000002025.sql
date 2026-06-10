-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/owner_id/alterations/alt0000002025


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN owner_id DROP NOT NULL;


