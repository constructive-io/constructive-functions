-- Deploy: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/is_built_in/alterations/alt0000000135
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_secret_definitions/columns/is_built_in/column


ALTER TABLE "constructive_infra_public".platform_secret_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;

