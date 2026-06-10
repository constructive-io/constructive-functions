-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/owner_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/table


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  ADD COLUMN owner_id uuid;

