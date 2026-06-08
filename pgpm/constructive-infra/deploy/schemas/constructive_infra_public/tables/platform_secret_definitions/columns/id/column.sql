-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ADD COLUMN id uuid;

