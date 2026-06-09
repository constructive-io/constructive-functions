-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/cpu_millicores/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN cpu_millicores RESTRICT;


