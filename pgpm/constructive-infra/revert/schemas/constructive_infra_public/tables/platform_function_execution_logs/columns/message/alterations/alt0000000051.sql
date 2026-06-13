-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/message/alterations/alt0000000051


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN message DROP NOT NULL;


