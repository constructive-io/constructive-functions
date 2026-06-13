-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/task_identifier/alterations/alt0000000076
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/table
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/task_identifier/column


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ALTER COLUMN task_identifier SET NOT NULL;

