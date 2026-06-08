-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/constraints/platform_namespaces_database_id_name_key/constraint


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP CONSTRAINT platform_namespaces_database_id_name_key;


