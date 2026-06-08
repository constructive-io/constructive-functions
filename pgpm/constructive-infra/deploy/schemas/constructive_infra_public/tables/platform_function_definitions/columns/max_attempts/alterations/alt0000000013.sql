-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/max_attempts/alterations/alt0000000013
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/max_attempts/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN max_attempts SET NOT NULL;

