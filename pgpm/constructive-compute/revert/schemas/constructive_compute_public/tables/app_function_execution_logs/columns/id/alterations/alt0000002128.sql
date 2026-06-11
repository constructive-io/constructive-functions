-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/id/alterations/alt0000002128


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  ALTER COLUMN id DROP NOT NULL;


