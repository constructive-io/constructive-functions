-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/alterations/alt0000000086
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/event_type/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespace_events.event_type IS E'Event type: created, activated, deactivated, labels_updated, annotations_updated, renamed';

