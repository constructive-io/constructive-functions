-- Revert: schemas/constructive_store_private/tables/org_secrets/constraints/org_secrets_namespace_id_fkey/constraint


ALTER TABLE "constructive_store_private".org_secrets 
  DROP CONSTRAINT org_secrets_namespace_id_fkey;


