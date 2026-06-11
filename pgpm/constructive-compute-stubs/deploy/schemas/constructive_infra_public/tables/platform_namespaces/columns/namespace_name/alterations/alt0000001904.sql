-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/namespace_name/alterations/alt0000001904
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/namespace_name/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN namespace_name SET NOT NULL;

