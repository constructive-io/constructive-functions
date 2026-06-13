-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/labels/alterations/alt0000000116
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/labels/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

