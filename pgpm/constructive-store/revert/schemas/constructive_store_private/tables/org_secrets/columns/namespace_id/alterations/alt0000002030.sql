-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/alterations/alt0000002030


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN namespace_id DROP NOT NULL;


