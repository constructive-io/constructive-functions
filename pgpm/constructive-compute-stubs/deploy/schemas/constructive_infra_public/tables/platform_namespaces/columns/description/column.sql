-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/columns/description/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ADD COLUMN description text;

