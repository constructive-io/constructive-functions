-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/id/alterations/alt0000002210


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  ALTER COLUMN id DROP DEFAULT;


