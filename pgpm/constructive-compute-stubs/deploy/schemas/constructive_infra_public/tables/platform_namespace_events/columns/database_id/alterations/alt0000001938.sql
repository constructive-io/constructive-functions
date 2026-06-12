-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/database_id/alterations/alt0000001938
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN database_id SET NOT NULL;

