-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/id/alterations/alt0000000006
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/id/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN id SET DEFAULT uuidv7();

