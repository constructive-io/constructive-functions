-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/partitions/default_partition
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table


CREATE TABLE "constructive_infra_public".platform_namespace_events_default
  PARTITION OF "constructive_infra_public".platform_namespace_events
  DEFAULT;
