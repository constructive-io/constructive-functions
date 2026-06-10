-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/actor_id/alterations/alt0000001928
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/actor_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespace_events.actor_id IS E'User who triggered this event (NULL for system/automated)';

