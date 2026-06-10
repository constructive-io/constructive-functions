-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/network_ingress_bytes/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ADD COLUMN network_ingress_bytes bigint;

