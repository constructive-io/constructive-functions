-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/constraints/platform_function_execution_logs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/created_at/column
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/id/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ADD CONSTRAINT platform_function_execution_logs_pkey PRIMARY KEY (created_at, id);

