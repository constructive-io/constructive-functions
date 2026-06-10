-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/alterations/alt0000002109
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/column


ALTER TABLE "constructive_compute_public".app_function_invocations 
  ALTER COLUMN owner_id SET NOT NULL;

