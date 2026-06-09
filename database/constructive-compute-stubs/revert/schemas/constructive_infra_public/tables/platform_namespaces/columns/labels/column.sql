-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/labels/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN labels RESTRICT;


