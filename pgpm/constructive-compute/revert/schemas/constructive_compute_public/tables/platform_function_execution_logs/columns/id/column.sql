-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  DROP COLUMN id RESTRICT;


