-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DROP COLUMN database_id RESTRICT;


