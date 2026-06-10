-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/created_at/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN created_at RESTRICT;


