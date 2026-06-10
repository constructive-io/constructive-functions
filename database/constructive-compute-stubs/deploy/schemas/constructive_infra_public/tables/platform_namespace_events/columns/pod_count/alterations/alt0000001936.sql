-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/pod_count/alterations/alt0000001936
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/pod_count/column


COMMENT ON COLUMN "constructive_infra_public".platform_namespace_events.pod_count IS 'Number of active pods in the namespace at time of event';

