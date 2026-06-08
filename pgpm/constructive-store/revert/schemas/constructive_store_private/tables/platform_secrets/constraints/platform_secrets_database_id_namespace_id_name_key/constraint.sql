-- Revert: schemas/constructive_store_private/tables/platform_secrets/constraints/platform_secrets_database_id_namespace_id_name_key/constraint


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP CONSTRAINT platform_secrets_database_id_namespace_id_name_key;


