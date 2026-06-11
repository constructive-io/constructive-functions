-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN database_id RESTRICT;


