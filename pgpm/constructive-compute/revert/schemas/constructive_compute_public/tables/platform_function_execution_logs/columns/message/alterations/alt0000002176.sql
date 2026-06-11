-- Revert: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/message/alterations/alt0000002176


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  ALTER COLUMN message DROP NOT NULL;


