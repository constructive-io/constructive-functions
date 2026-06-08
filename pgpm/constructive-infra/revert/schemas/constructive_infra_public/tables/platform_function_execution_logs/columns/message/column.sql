-- Revert: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/message/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DROP COLUMN message RESTRICT;


