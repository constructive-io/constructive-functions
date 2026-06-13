-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/metadata/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DROP COLUMN metadata RESTRICT;


