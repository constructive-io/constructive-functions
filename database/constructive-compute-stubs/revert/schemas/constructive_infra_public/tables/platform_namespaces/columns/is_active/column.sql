-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/is_active/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN is_active RESTRICT;


