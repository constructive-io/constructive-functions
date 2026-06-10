-- Revert: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/alterations/alt0000001916


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN database_id DROP NOT NULL;


