-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/created_at/alterations/alt0000000082
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/created_at/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespace_events.created_at IS E'Event timestamp (partition key)';

