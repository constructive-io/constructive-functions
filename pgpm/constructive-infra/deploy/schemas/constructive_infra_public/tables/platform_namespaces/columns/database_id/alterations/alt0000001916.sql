-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/alterations/alt0000001916
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN database_id SET NOT NULL;

