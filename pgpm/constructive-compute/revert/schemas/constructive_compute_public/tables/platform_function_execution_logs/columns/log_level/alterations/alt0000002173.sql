-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000002173


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  ALTER COLUMN log_level DROP NOT NULL;


