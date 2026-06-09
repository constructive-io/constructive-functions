-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ADD COLUMN updated_at timestamptz;

