-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/alterations/alt0000000118
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN name SET NOT NULL;

