-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  DROP COLUMN log_level RESTRICT;


