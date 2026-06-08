-- Revert: schemas/constructive_store_public/tables/platform_config/constraints/platform_configs_namespace_id_name_key/constraint


ALTER TABLE "constructive_store_public".platform_config 
  DROP CONSTRAINT platform_configs_namespace_id_name_key;


