-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/constraints/platform_namespace_events_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/created_at/column
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ADD CONSTRAINT platform_namespace_events_pkey PRIMARY KEY (created_at, id);

