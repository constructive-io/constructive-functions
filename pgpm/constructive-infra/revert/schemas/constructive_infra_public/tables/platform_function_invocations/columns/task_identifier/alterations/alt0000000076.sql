-- Revert: schemas/constructive_infra_public/tables/platform_function_invocations/columns/task_identifier/alterations/alt0000000076


ALTER TABLE "constructive_infra_public".platform_function_invocations 
  ALTER COLUMN task_identifier DROP NOT NULL;


