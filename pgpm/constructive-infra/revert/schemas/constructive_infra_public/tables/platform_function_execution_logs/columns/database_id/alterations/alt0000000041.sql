-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/database_id/alterations/alt0000000041


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN database_id DROP NOT NULL;


