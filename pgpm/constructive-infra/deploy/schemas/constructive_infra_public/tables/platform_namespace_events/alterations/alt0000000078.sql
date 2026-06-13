-- Deploy: schemas/constructive_infra_public/tables/platform_namespace_events/alterations/alt0000000078
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespace_events/table


ALTER TABLE "constructive_infra_public".platform_namespace_events 
  DISABLE ROW LEVEL SECURITY;

