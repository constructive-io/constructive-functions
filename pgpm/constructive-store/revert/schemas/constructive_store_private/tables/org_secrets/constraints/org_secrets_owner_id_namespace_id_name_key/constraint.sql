-- Revert: schemas/constructive_store_private/tables/org_secrets/constraints/org_secrets_owner_id_namespace_id_name_key/constraint


ALTER TABLE "constructive_store_private".org_secrets 
  DROP CONSTRAINT org_secrets_owner_id_namespace_id_name_key;


