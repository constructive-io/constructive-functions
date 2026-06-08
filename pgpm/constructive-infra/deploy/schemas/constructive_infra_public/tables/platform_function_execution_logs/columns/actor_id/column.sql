-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/actor_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ADD COLUMN actor_id uuid;

