-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/storage_bytes/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN storage_bytes RESTRICT;


