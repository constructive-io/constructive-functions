-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/alterations/alt0000000087
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ADD CONSTRAINT platform_namespace_events_event_type_chk 
    CHECK (event_type IN ( 'created', 'activated', 'deactivated', 'labels_updated', 'annotations_updated', 'renamed', 'deleted', 'metrics_snapshot', 'scaled', 'quota_exceeded', 'resource_warning' ));

