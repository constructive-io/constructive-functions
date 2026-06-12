-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000002196


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  DROP CONSTRAINT platform_function_execution_logs_log_level_chk;


