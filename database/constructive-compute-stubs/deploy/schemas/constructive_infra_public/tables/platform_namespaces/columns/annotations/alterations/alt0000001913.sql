-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/annotations/alterations/alt0000001913
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/annotations/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN annotations SET NOT NULL;

