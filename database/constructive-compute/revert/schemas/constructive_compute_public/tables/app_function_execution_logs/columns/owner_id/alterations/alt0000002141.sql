-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/owner_id/alterations/alt0000002141


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  ALTER COLUMN owner_id DROP NOT NULL;


