-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/database_id/alterations/alt0000002180


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  ALTER COLUMN database_id DROP NOT NULL;


