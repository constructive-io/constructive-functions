-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/database_id/alterations/alt0000001938


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN database_id DROP NOT NULL;


