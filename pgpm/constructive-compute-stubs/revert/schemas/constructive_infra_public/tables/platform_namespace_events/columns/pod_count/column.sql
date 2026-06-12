-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/pod_count/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN pod_count RESTRICT;


