-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000000050


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DROP CONSTRAINT platform_function_execution_logs_log_level_chk;


