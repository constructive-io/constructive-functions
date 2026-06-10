-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/id/alterations/alt0000002169
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/id/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ALTER COLUMN id SET DEFAULT uuidv7();

