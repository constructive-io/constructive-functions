-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/indexes/platform_namespace_events_namespace_id_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/created_at/column
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/namespace_id/column


CREATE INDEX platform_namespace_events_namespace_id_created_at_idx ON "constructive_infra_public".platform_namespace_events USING BTREE ( namespace_id, created_at );

