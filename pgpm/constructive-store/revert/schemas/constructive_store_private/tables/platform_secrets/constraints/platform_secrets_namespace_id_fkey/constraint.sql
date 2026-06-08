-- Revert: schemas/constructive_store_private/tables/platform_secrets/constraints/platform_secrets_namespace_id_fkey/constraint


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP CONSTRAINT platform_secrets_namespace_id_fkey;


