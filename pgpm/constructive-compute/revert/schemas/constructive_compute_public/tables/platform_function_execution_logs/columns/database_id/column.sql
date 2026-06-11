-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/database_id/column


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  DROP COLUMN database_id RESTRICT;


