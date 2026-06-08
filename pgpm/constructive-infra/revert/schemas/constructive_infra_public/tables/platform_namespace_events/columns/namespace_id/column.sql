-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/namespace_id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN namespace_id RESTRICT;


