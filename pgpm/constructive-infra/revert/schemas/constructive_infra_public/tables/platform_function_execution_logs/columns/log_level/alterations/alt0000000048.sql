-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000000048


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN log_level DROP DEFAULT;


