-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/log_level/alterations/alt0000002143


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  DROP CONSTRAINT app_function_execution_logs_log_level_chk;


