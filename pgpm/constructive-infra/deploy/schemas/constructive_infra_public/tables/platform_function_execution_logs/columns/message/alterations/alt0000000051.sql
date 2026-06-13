-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/message/alterations/alt0000000051
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/message/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN message SET NOT NULL;

