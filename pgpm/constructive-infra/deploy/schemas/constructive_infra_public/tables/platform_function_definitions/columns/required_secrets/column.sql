-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/required_secrets/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ADD COLUMN required_secrets "constructive_infra_public".function_requirement[];

