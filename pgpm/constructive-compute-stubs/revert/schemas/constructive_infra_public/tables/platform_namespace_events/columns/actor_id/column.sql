-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/actor_id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN actor_id RESTRICT;


