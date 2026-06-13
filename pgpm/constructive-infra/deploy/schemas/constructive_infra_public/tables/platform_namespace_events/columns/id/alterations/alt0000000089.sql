-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/columns/id/alterations/alt0000000089
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/columns/id/column


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  ALTER COLUMN id SET DEFAULT uuidv7();

