-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/updated_at/alterations/alt0000000122
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/updated_at/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN updated_at SET DEFAULT now();

