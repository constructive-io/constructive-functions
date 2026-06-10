-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/memory_bytes/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ADD COLUMN memory_bytes bigint;

