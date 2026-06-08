-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/error/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/table


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ADD COLUMN error text;

