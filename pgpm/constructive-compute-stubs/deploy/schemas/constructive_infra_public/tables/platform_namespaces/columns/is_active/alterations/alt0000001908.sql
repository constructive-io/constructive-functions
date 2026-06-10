-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/is_active/alterations/alt0000001908
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/is_active/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN is_active SET DEFAULT true;

