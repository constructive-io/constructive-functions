-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/database_id/alterations/alt0000000041
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/database_id/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN database_id SET NOT NULL;

