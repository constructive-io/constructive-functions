-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DROP COLUMN log_level RESTRICT;


