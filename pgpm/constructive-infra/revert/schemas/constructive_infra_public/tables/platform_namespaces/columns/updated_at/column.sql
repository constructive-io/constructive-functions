-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/updated_at/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN updated_at RESTRICT;


