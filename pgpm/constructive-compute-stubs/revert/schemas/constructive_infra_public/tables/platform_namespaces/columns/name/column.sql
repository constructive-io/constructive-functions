-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN name RESTRICT;


