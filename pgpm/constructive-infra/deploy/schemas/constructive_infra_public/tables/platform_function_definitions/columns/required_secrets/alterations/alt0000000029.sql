-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/alterations/alt0000000029
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/column


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN required_secrets SET DEFAULT ARRAY[]::"constructive_infra_public".function_requirement[];

