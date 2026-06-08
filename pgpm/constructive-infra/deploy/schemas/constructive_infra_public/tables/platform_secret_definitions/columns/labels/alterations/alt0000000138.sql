-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/labels/alterations/alt0000000138
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/labels/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

