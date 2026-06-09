-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/namespace_name/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN namespace_name RESTRICT;


