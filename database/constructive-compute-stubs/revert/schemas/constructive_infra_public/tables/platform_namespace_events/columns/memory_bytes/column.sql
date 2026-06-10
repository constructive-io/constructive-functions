-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/memory_bytes/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN memory_bytes RESTRICT;


