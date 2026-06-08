-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000000048
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN log_level SET DEFAULT 'info';

