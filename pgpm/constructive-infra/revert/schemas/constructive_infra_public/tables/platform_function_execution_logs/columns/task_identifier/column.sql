-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/task_identifier/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DROP COLUMN task_identifier RESTRICT;


