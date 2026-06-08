-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/id/alterations/alt0000000132
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/id/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN id SET NOT NULL;

