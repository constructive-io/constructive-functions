-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/key_id/alterations/alt0000000014


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN key_id DROP DEFAULT;


