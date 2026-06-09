-- Revert: schemas/constructive_infra_public/tables/platform_namespace_events/columns/network_ingress_bytes/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DROP COLUMN network_ingress_bytes RESTRICT;


