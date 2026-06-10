-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/message/alterations/alt0000002137


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  ALTER COLUMN message DROP NOT NULL;


