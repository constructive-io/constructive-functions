-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/alterations/alt0000001926
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN event_type SET NOT NULL;

