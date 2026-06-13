-- Revert: schemas/constructive_infra_public/tables/platform_function_definitions/columns/task_identifier/alterations/alt0000000034


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ALTER COLUMN task_identifier DROP NOT NULL;


