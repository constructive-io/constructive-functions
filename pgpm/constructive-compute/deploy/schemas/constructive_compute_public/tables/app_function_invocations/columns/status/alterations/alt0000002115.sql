-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/alterations/alt0000002115
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ALTER COLUMN status SET DEFAULT 'pending';

