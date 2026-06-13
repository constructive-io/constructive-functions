-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/namespace_id/alterations/alt0000000095
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/namespace_id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN namespace_id SET NOT NULL;

