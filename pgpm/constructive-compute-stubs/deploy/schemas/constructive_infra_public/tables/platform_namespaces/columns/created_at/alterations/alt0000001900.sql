-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/created_at/alterations/alt0000001900
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/created_at/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ALTER COLUMN created_at SET DEFAULT now();

