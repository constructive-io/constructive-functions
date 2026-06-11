-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  DROP COLUMN database_id RESTRICT;


