-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/annotations/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN annotations RESTRICT;


