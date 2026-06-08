-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/columns/is_invocable/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ADD COLUMN is_invocable boolean;

