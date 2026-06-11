-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/id/alterations/alt0000001899
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/id/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN id SET DEFAULT uuidv7();

