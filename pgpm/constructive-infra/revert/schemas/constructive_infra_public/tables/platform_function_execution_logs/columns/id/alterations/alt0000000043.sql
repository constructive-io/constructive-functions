-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/id/alterations/alt0000000043


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN id DROP NOT NULL;


