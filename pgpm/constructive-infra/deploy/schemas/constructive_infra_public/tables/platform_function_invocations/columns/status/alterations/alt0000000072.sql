-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/alterations/alt0000000072
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/table
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ALTER COLUMN status SET NOT NULL;

