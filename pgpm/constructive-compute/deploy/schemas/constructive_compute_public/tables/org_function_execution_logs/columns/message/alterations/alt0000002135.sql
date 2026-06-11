-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/message/alterations/alt0000002135
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/message/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ALTER COLUMN message SET NOT NULL;

