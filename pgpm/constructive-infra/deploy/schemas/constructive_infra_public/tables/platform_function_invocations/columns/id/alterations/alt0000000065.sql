-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/id/alterations/alt0000000065
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/table
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/id/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ALTER COLUMN id SET NOT NULL;

